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

    <!-- Tổng quan phạt của người dùng -->
    <div class="row mb-4" v-if="penaltySummary.totalPenalty > 0">
      <div class="col-md-12">
        <div class="alert alert-warning">
          <h5>
            <i class="fas fa-exclamation-triangle"></i> Tổng tiền phạt của bạn
          </h5>
          <p class="mb-0">
            <strong>{{ formatCurrency(penaltySummary.totalPenalty) }}</strong>
            ({{ penaltySummary.totalOverdueReturns }} lần trả trễ, trung bình
            {{ penaltySummary.avgLateDays.toFixed(1) }} ngày/lần)
          </p>
        </div>
      </div>
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
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: currentTab === 'overdue' }"
          @click="currentTab = 'overdue'"
          >Trả trễ
          <span class="badge bg-danger ms-1" v-if="overdueCount > 0">{{
            overdueCount
          }}</span>
        </a>
      </li>
    </ul>

    <!-- Danh sách yêu cầu mượn sách -->
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Sách</th>
            <th>Ngày mượn</th>
            <th>Ngày hẹn trả</th>
            <th
              v-if="
                currentTab === 'all' ||
                currentTab === 'returned' ||
                currentTab === 'overdue'
              "
            >
              Ngày trả
            </th>
            <th>Trạng thái</th>
            <th
              v-if="
                currentTab === 'all' ||
                currentTab === 'returned' ||
                currentTab === 'overdue'
              "
            >
              Phạt
            </th>
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
            <td>
              {{ formatDate(request.ngayHenTra) }}
              <span
                v-if="isOverdue(request) && request.trangThai === 'Đã duyệt'"
                class="badge bg-danger ms-1"
                >Quá hạn</span
              >
            </td>
            <td
              v-if="
                currentTab === 'all' ||
                currentTab === 'returned' ||
                currentTab === 'overdue'
              "
            >
              {{ request.ngayTra ? formatDate(request.ngayTra) : "-" }}
            </td>
            <td>
              <span :class="getStatusBadgeClass(request.trangThai)">{{
                request.trangThai
              }}</span>
            </td>
            <td
              v-if="
                currentTab === 'all' ||
                currentTab === 'returned' ||
                currentTab === 'overdue'
              "
            >
              <div v-if="request.tienPhat && request.tienPhat > 0">
                <span class="text-danger fw-bold">{{
                  formatCurrency(request.tienPhat)
                }}</span
                ><br />
                <small class="text-muted"
                  >{{ request.soNgayTre }} ngày trễ</small
                >
              </div>
              <span v-else class="text-success">-</span>
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

    // Tính toán tổng quan phạt
    const penaltySummary = computed(() => {
      const overdueReturns = borrowHistory.value.filter(
        (request) => request.trangThai === "Đã trả" && request.tienPhat > 0
      );

      const totalPenalty = overdueReturns.reduce(
        (sum, request) => sum + (request.tienPhat || 0),
        0
      );
      const totalOverdueReturns = overdueReturns.length;
      const avgLateDays =
        totalOverdueReturns > 0
          ? overdueReturns.reduce(
              (sum, request) => sum + (request.soNgayTre || 0),
              0
            ) / totalOverdueReturns
          : 0;

      return {
        totalPenalty,
        totalOverdueReturns,
        avgLateDays,
      };
    });

    // Đếm số lần trả trễ
    const overdueCount = computed(() => {
      return borrowHistory.value.filter(
        (request) => request.trangThai === "Đã trả" && request.tienPhat > 0
      ).length;
    });

    const filteredRequests = computed(() => {
      let results = borrowHistory.value;

      if (currentTab.value !== "all") {
        const statusMap = {
          pending: "Chờ duyệt",
          approved: "Đã duyệt",
          rejected: "Từ chối",
          returned: "Đã trả",
          overdue: "overdue_special", // Xử lý riêng
        };

        if (currentTab.value === "overdue") {
          results = results.filter(
            (request) => request.trangThai === "Đã trả" && request.tienPhat > 0
          );
        } else {
          results = results.filter(
            (request) => request.trangThai === statusMap[currentTab.value]
          );
        }
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
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString("vi-VN");
    };

    const formatCurrency = (value) => {
      if (!value) return "0 ₫";
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    };

    const isOverdue = (request) => {
      if (!request.ngayHenTra || request.trangThai !== "Đã duyệt") return false;
      return new Date() > new Date(request.ngayHenTra);
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
      return currentTab.value === "all" ||
        currentTab.value === "returned" ||
        currentTab.value === "overdue"
        ? 6
        : 4;
    });

    onMounted(fetchHistory);

    return {
      currentTab,
      filteredRequests,
      loading,
      error,
      searchTerm,
      penaltySummary,
      overdueCount,
      formatDate,
      formatCurrency,
      isOverdue,
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
.alert-warning {
  background-color: #fff3cd;
  border-color: #ffecb3;
  color: #856404;
}
.fw-bold {
  font-weight: bold !important;
}
</style>
