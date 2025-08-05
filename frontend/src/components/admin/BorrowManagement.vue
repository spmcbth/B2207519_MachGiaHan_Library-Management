<template>
  <div class="borrow-management">
    <LoadingSpinner :show="loading" />
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Quản lý mượn sách</h2>
    </div>

    <!-- Phần tìm kiếm -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            v-model="searchTerm"
            placeholder="Tìm kiếm theo tên độc giả, mã độc giả, tên sách, mã sách"
          />
          <span class="input-group-text">
            <i class="fas fa-search"></i>
          </span>
        </div>
      </div>
    </div>

    <!-- Tabs for different request status -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: currentTab === 'pending' }"
          @click="currentTab = 'pending'"
        >
          Chờ duyệt
        </a>
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: currentTab === 'approved' }"
          @click="currentTab = 'approved'"
        >
          Đã duyệt
        </a>
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: currentTab === 'rejected' }"
          @click="currentTab = 'rejected'"
        >
          Đã từ chối
        </a>
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: currentTab === 'returned' }"
          @click="currentTab = 'returned'"
        >
          Đã trả
        </a>
      </li>
    </ul>

    <!-- Danh sách yêu cầu mượn sách -->
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Độc giả</th>
            <th>Sách</th>
            <th>Ngày mượn</th>
            <!-- Chỉ hiện cột Ngày trả ở tab Đã trả hoặc All -->
            <th v-if="currentTab === 'returned' || currentTab === 'all'">
              Ngày trả
            </th>
            <th>Trạng thái</th>
            <!-- Ẩn cột Thao tác ở tab Đã từ chối và Đã trả -->
            <th v-if="currentTab !== 'rejected' && currentTab !== 'returned'">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in filteredRequests" :key="request._id">
            <td>
              {{ request.maDocGia?.hoLot || "N/A" }}
              {{ request.maDocGia?.ten || "" }}
              <br />
              <small class="text-muted">{{
                request.maDocGia?.maDocGia || "N/A"
              }}</small>
            </td>
            <td>
              {{ request.maSach?.tenSach || "N/A" }}
              <br />
              <small class="text-muted">{{
                request.maSach?.maSach || "N/A"
              }}</small>
              <br />
              <small :class="getQuantityClass(request.maSach?.soQuyen)">
                Còn lại: {{ request.maSach?.soQuyen || 0 }} quyển
              </small>
            </td>
            <td>{{ formatDate(request.ngayMuon) }}</td>
            <!-- Chỉ hiện cột Ngày trả ở tab Đã trả hoặc All -->
            <td v-if="currentTab === 'returned' || currentTab === 'all'">
              {{ request.ngayTra ? formatDate(request.ngayTra) : "-" }}
            </td>
            <td>
              <span :class="getStatusBadgeClass(request.trangThai)">
                {{ request.trangThai }}
              </span>
            </td>
            <!-- Ẩn cột Thao tác ở tab Đã từ chối và Đã trả -->
            <td v-if="currentTab !== 'rejected' && currentTab !== 'returned'">
              <template v-if="request.trangThai === 'Chờ duyệt'">
                <button
                  class="btn btn-sm btn-success me-2"
                  @click="showConfirmAction('approve', request)"
                  :disabled="request.maSach?.soQuyen <= 0"
                >
                  <i class="fas fa-check"></i> Duyệt
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  @click="showConfirmAction('reject', request)"
                >
                  <i class="fas fa-times"></i> Từ chối
                </button>
              </template>
              <template v-if="request.trangThai === 'Đã duyệt'">
                <button
                  class="btn btn-sm btn-info"
                  @click="showConfirmAction('return', request)"
                >
                  <i class="fas fa-undo"></i> Đánh dấu đã trả
                </button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="modal" tabindex="-1" :class="{ 'd-block': showConfirmModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận {{ getActionTitle }}</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeConfirmModal"
            ></button>
          </div>
          <div class="modal-body">
            <p>{{ confirmMessage }}</p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeConfirmModal"
            >
              Hủy
            </button>
            <button
              type="button"
              :class="getActionButtonClass"
              @click="handleConfirmAction"
              :disabled="loading"
            >
              {{ loading ? "Đang xử lý..." : getActionButtonText }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showConfirmModal"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted, getCurrentInstance } from "vue";
import { useStore } from "vuex";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { showError } from "@/utils/notifications";

export default {
  name: "BorrowManagement",
  components: { LoadingSpinner },
  setup() {
    const store = useStore();
    const currentTab = ref("pending");
    const loading = ref(false);
    const { proxy } = getCurrentInstance();
    const showConfirmModal = ref(false);
    const selectedRequest = ref(null);
    const selectedAction = ref("");
    const searchTerm = ref("");

    const borrowRequests = computed(
      () => store.getters["borrow/allBorrowRequests"]
    );

    const filteredRequests = computed(() => {
      let requests = borrowRequests.value;

      if (currentTab.value !== "all") {
        const statusMap = {
          pending: "Chờ duyệt",
          approved: "Đã duyệt",
          rejected: "Từ chối",
          returned: "Đã trả",
        };
        requests = requests.filter(
          (request) => request.trangThai === statusMap[currentTab.value]
        );
      }

      if (searchTerm.value.trim()) {
        const search = searchTerm.value.toLowerCase().trim();
        requests = requests.filter(
          (request) =>
            `${request.maDocGia?.hoLot} ${request.maDocGia?.ten}`
              .toLowerCase()
              .includes(search) ||
            request.maDocGia?.maDocGia.toLowerCase().includes(search) ||
            request.maSach?.tenSach.toLowerCase().includes(search) ||
            request.maSach?.maSach.toLowerCase().includes(search)
        );
      }

      return requests;
    });

    const getActionTitle = computed(() => {
      const titles = {
        approve: "duyệt yêu cầu",
        reject: "từ chối yêu cầu",
        return: "xác nhận trả sách",
      };
      return titles[selectedAction.value] || "";
    });

    const confirmMessage = computed(() => {
      if (!selectedRequest.value) return "";
      const messages = {
        approve: `Bạn có chắc muốn duyệt yêu cầu mượn sách "${selectedRequest.value.maSach?.tenSach}" của độc giả "${selectedRequest.value.maDocGia?.hoLot} ${selectedRequest.value.maDocGia?.ten}" không?`,
        reject: `Bạn có chắc muốn từ chối yêu cầu mượn sách "${selectedRequest.value.maSach?.tenSach}" của độc giả "${selectedRequest.value.maDocGia?.hoLot} ${selectedRequest.value.maDocGia?.ten}" không?`,
        return: `Bạn có chắc muốn xác nhận độc giả "${selectedRequest.value.maDocGia?.hoLot} ${selectedRequest.value.maDocGia?.ten}" đã trả sách "${selectedRequest.value.maSach?.tenSach}" không?`,
      };
      return messages[selectedAction.value] || "";
    });

    const getActionButtonClass = computed(() => {
      const classes = {
        approve: "btn btn-success",
        reject: "btn btn-danger",
        return: "btn btn-info",
      };
      return classes[selectedAction.value] || "btn btn-primary";
    });

    const getActionButtonText = computed(() => {
      const texts = {
        approve: "Duyệt",
        reject: "Từ chối",
        return: "Xác nhận",
      };
      return texts[selectedAction.value] || "";
    });

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("vi-VN");
    };

    const getStatusBadgeClass = (status) => {
      const classes = {
        "Chờ duyệt": "badge bg-warning",
        "Đã duyệt": "badge bg-success",
        "Từ chối": "badge bg-danger",
        "Đã trả": "badge bg-info",
      };
      return classes[status] || "badge bg-secondary";
    };

    const fetchBorrowRequests = async () => {
      loading.value = true;
      try {
        await store.dispatch("borrow/fetchBorrowRequests");
      } catch (error) {
        showError(error);
      } finally {
        loading.value = false;
      }
    };

    const getQuantityClass = (quantity) => {
      if (quantity <= 0) return "text-danger fw-bold";
      if (quantity < 3) return "text-warning fw-bold";
      return "text-success";
    };

    const showConfirmAction = (action, request) => {
      selectedAction.value = action;
      selectedRequest.value = request;
      showConfirmModal.value = true;
    };

    const closeConfirmModal = () => {
      showConfirmModal.value = false;
      selectedRequest.value = null;
      selectedAction.value = "";
    };

    const handleConfirmAction = async () => {
      const statusMap = {
        approve: "Đã duyệt",
        reject: "Từ chối",
        return: "Đã trả",
      };

      await updateStatus(
        selectedRequest.value._id,
        statusMap[selectedAction.value]
      );
      closeConfirmModal();
    };

    const updateStatus = async (id, status) => {
      loading.value = true;
      try {
        await store.dispatch("borrow/updateBorrowStatus", { id, status });
        proxy.$toast.show("Cập nhật trạng thái thành công", "success");
        await fetchBorrowRequests();
      } catch (error) {
        proxy.$toast.show(
          error.response?.data?.message || "Có lỗi xảy ra",
          "danger"
        );
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchBorrowRequests);

    return {
      currentTab,
      loading,
      searchTerm,
      filteredRequests,
      showConfirmModal,
      selectedRequest,
      selectedAction,
      getActionTitle,
      confirmMessage,
      getActionButtonClass,
      getActionButtonText,
      formatDate,
      getStatusBadgeClass,
      getQuantityClass,
      showConfirmAction,
      closeConfirmModal,
      handleConfirmAction,
      updateStatus,
    };
  },
};
</script>

<style scoped>
.card {
  transition: transform 0.2s;
}
.card:hover {
  transform: translateY(-5px);
}
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
.table {
  font-size: 0.95rem;
  border-collapse: collapse;
}
.table thead th {
  background-color: #e1f5fe;
  color: #0277bd;
  font-weight: 600;
  vertical-align: middle;
  padding: 12px;
}
.table-striped > tbody > tr:nth-child(odd) {
  background-color: #f8fbfc;
}
.input-group {
  max-width: 500px;
}
.input-group-text {
  background-color: white;
  border-left: none;
  color: #4fc3f7;
  border-radius: 0 6px 6px 0;
  border: 1px solid #cfd8dc;
  border-left: 0;
}
.form-control {
  border-right: none;
  border-radius: 6px 0 0 6px;
  font-size: 0.95rem;
  border: 1px solid #cfd8dc;
  transition: border-color 0.2s ease;
}
.form-control:focus {
  border-color: #4fc3f7;
  box-shadow: 0 0 0 2px rgba(79, 195, 247, 0.1);
  outline: none;
}
.form-control:focus + .input-group-text {
  border-color: #4fc3f7;
}
.badge {
  font-size: 0.85em;
  padding: 0.4em 0.6em;
  border-radius: 6px;
  text-transform: capitalize;
}
.badge.bg-warning {
  background-color: #fff3cd;
  color: #856404;
}
.badge.bg-success {
  background-color: #d4edda;
  color: #155724;
}
.badge.bg-danger {
  background-color: #f8d7da;
  color: #721c24;
}
.badge.bg-info {
  background-color: #d1ecf1;
  color: #0c5460;
}
.badge.bg-secondary {
  background-color: #eceff1;
  color: #546e7a;
}
.text-danger {
  font-weight: bold;
  color: #dc3545 !important;
}
.text-warning {
  font-weight: bold;
  color: #ffc107 !important;
}
.text-success {
  font-weight: bold;
  color: #198754 !important;
}
.text-muted {
  font-size: 0.85em;
  font-style: italic;
  color: #78909c;
}
.btn-primary {
  background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%);
  border: none;
  font-weight: 500;
  padding: 8px 16px;
  transition: all 0.2s ease;
  border-radius: 6px;
}
.btn-primary:hover {
  background: #29b6f6;
}
</style>
