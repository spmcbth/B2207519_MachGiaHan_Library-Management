<template>
  <div class="borrow-history">
    <LoadingSpinner :show="loading" />

    <h2>Lịch sử mượn sách</h2>

    <!-- Error Alert -->
    <div
      v-if="error"
      class="alert alert-danger alert-dismissible fade show"
      role="alert"
    >
      {{ error }}
      <button type="button" class="btn-close" @click="clearError"></button>
    </div>

    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            v-model="searchTerm"
            placeholder="Tìm kiếm theo tên sách, mã sách"
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
          :class="{ active: currentTab === 'all' }"
          @click="currentTab = 'all'"
          >Tất cả</a
        >
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: currentTab === 'pending' }"
          @click="currentTab = 'pending'"
          >Chờ duyệt</a
        >
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: currentTab === 'approved' }"
          @click="currentTab = 'approved'"
          >Đã duyệt</a
        >
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: currentTab === 'rejected' }"
          @click="currentTab = 'rejected'"
          >Bị từ chối</a
        >
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: currentTab === 'returned' }"
          @click="currentTab = 'returned'"
          >Đã trả</a
        >
      </li>
    </ul>

    <!-- Danh sách yêu cầu mượn sách -->
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Sách</th>
            <th>Ngày mượn</th>
            <th v-if="currentTab === 'all' || currentTab === 'returned'">
              Ngày trả
            </th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in filteredRequests" :key="request._id">
            <td>
              {{ request.maSach?.tenSach || "N/A" }}<br />
              <small class="text-muted"
                >Mã sách: {{ request.maSach?.maSach || "N/A" }}</small
              >
            </td>
            <td>{{ formatDate(request.ngayMuon) }}</td>
            <td v-if="currentTab === 'all' || currentTab === 'returned'">
              {{ request.ngayTra ? formatDate(request.ngayTra) : "-" }}
            </td>
            <td>
              <span :class="getStatusBadgeClass(request.trangThai)">{{
                request.trangThai
              }}</span>
            </td>
          </tr>
          <tr v-if="filteredRequests.length === 0">
            <td :colspan="getColspan">Không có dữ liệu</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { showError } from "@/utils/notifications";

export default {
  name: "BorrowHistory",
  components: { LoadingSpinner },
  setup() {
    const store = useStore();
    const currentTab = ref("all");
    const loading = ref(false);
    const error = ref(null);
    const searchTerm = ref("");

    const borrowHistory = computed(() => store.getters["borrow/borrowHistory"]);

    const filteredRequests = computed(() => {
      let results = borrowHistory.value;

      if (currentTab.value !== "all") {
        const statusMap = {
          pending: "Chờ duyệt",
          approved: "Đã duyệt",
          rejected: "Từ chối",
          returned: "Đã trả",
        };
        results = results.filter(
          (request) => request.trangThai === statusMap[currentTab.value]
        );
      }

      if (searchTerm.value.trim()) {
        const search = searchTerm.value.toLowerCase().trim();
        results = results.filter(
          (request) =>
            request.maSach?.tenSach?.toLowerCase().includes(search) ||
            request.maSach?.maSach?.toLowerCase().includes(search)
        );
      }

      return results;
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

    const fetchHistory = async () => {
      loading.value = true;
      try {
        await store.dispatch("borrow/fetchBorrowHistory");
      } catch (err) {
        error.value = err.message;
        showError(err);
      } finally {
        loading.value = false;
      }
    };

    const clearError = () => {
      error.value = null;
      store.commit("borrow/SET_ERROR", null);
    };

    const getColspan = computed(() => {
      return currentTab.value === "all" || currentTab.value === "returned"
        ? 4
        : 3;
    });

    onMounted(fetchHistory);

    return {
      currentTab,
      filteredRequests,
      loading,
      error,
      searchTerm,
      formatDate,
      getStatusBadgeClass,
      clearError,
      getColspan,
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
