<template>
  <div class="admin-home-page">
    <LoadingSpinner v-if="loading" show />

    <h2 class="mb-4">Tổng quan thư viện</h2>

    <!-- Error Alert -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show">
      {{ error }}
      <button type="button" class="btn-close" @click="clearError"></button>
    </div>

    <!-- Thống kê cơ bản -->
    <div class="row mb-5">
      <div class="col-md-3">
        <div class="card mb-3">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="icon-wrapper bg-success bg-opacity-10 me-3">
                <i class="fas fa-book text-success"></i>
              </div>
              <div>
                <h3 class="card-title text-success mb-0">{{ totalBooks }}</h3>
                <p class="card-text mb-0">Tổng số sách</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card mb-3">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="icon-wrapper bg-warning bg-opacity-10 me-3">
                <i class="fas fa-user-edit text-warning"></i>
              </div>
              <div>
                <h3 class="card-title text-warning mb-0">{{ totalAuthors }}</h3>
                <p class="card-text mb-0">Tổng số tác giả</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card mb-3">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="icon-wrapper bg-primary bg-opacity-10 me-3">
                <i class="fas fa-building text-primary"></i>
              </div>
              <div>
                <h3 class="card-title text-primary mb-0">{{ totalPublishers }}</h3>
                <p class="card-text mb-0">Nhà xuất bản</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card mb-3">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="icon-wrapper bg-info bg-opacity-10 me-3">
                <i class="fas fa-hand-holding text-info"></i>
              </div>
              <div>
                <h3 class="card-title text-info mb-0">{{ totalBorrowedBooks }}</h3>
                <p class="card-text mb-0">Đang được mượn</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Thống kê phạt và quá hạn -->
    <h3 class="mb-3">Thống kê mượn trả</h3>
    <div class="row mb-5">
      <div class="col-md-3">
        <div class="card mb-3 border-danger">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="icon-wrapper bg-danger bg-opacity-10 me-3">
                <i class="fas fa-exclamation-triangle text-danger"></i>
              </div>
              <div>
                <h3 class="card-title text-danger mb-0">{{ currentOverdueCount }}</h3>
                <p class="card-text mb-0">Sách quá hạn</p>
                <small class="text-muted">Chưa trả</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card mb-3 border-warning">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="icon-wrapper bg-warning bg-opacity-10 me-3">
                <i class="fas fa-clock text-warning"></i>
              </div>
              <div>
                <h3 class="card-title text-warning mb-0">{{ totalOverdueReturns }}</h3>
                <p class="card-text mb-0">Lần trả trễ</p>
                <small class="text-muted">Tổng cộng</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card mb-3 border-success">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="icon-wrapper bg-success bg-opacity-10 me-3">
                <i class="fas fa-money-bill-wave text-success"></i>
              </div>
              <div>
                <h3 class="card-title text-success mb-0">{{ formatCurrency(totalPenalty) }}</h3>
                <p class="card-text mb-0">Tổng tiền phạt</p>
                <small class="text-muted">Đã thu</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card mb-3 border-secondary">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="icon-wrapper bg-secondary bg-opacity-10 me-3">
                <i class="fas fa-check-circle text-secondary"></i>
              </div>
              <div>
                <h3 class="card-title text-secondary mb-0">{{ totalReturned }}</h3>
                <p class="card-text mb-0">Sách đã trả</p>
                <small class="text-muted">Hoàn thành</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Biểu đồ tỷ lệ trả đúng hạn -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Tỷ lệ trả sách</h5>
          </div>
          <div class="card-body">
            <div class="progress-container">
              <div class="progress-item">
                <div class="d-flex justify-content-between">
                  <span class="text-success">Trả đúng hạn</span>
                  <span class="fw-bold text-success">{{ onTimeReturnRate }}%</span>
                </div>
                <div class="progress mt-1">
                  <div 
                    class="progress-bar bg-success" 
                    :style="{ width: onTimeReturnRate + '%' }"
                  ></div>
                </div>
              </div>
              <div class="progress-item mt-3">
                <div class="d-flex justify-content-between">
                  <span class="text-danger">Trả trễ</span>
                  <span class="fw-bold text-danger">{{ lateReturnRate }}%</span>
                </div>
                <div class="progress mt-1">
                  <div 
                    class="progress-bar bg-danger" 
                    :style="{ width: lateReturnRate + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Thống kê nhanh</h5>
          </div>
          <div class="card-body">
            <div class="stat-item d-flex justify-content-between align-items-center py-2">
              <span class="text-muted">Trung bình phạt/lần:</span>
              <span class="fw-bold">{{ formatCurrency(averagePenalty) }}</span>
            </div>
            <hr class="my-2">
            <div class="stat-item d-flex justify-content-between align-items-center py-2">
              <span class="text-muted">Tổng độc giả:</span>
              <span class="fw-bold">{{ totalReaders }}</span>
            </div>
            <hr class="my-2">
            <div class="stat-item d-flex justify-content-between align-items-center py-2">
              <span class="text-muted">Sách có sẵn:</span>
              <span class="fw-bold text-success">{{ availableBooks }}</span>
            </div>
            <hr class="my-2">
            <div class="stat-item d-flex justify-content-between align-items-center py-2">
              <span class="text-muted">Yêu cầu chờ duyệt:</span>
              <span class="fw-bold text-warning">{{ pendingRequests }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Thêm phần này để hiển thị danh sách sách quá hạn -->
    <div class="mt-5">
      <h3 class="mb-3">Danh sách sách đang quá hạn</h3>
      <OverdueBook />
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from "vue";
import { useStore } from "vuex";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { showError } from "@/utils/notifications";
import OverdueBook from "@/components/admin/OverdueBook.vue";

export default {
  name: "AdminHomePage",
  components: {
    LoadingSpinner,
    OverdueBook,
  },
  setup() {
    const store = useStore();

    // Computed properties từ Vuex
    const totalBooks = computed(
      () => store.getters["book/allBooks"]?.length || 0
    );
    const totalAuthors = computed(
      () => store.getters["author/allAuthors"]?.length || 0
    );
    const totalPublishers = computed(
      () => store.getters["publisher/allPublishers"]?.length || 0
    );
    const totalBorrowedBooks = computed(
      () =>
        store.getters["borrow/allBorrowRequests"]?.filter(
          (req) => req.trangThai === "Đã duyệt"
        ).length || 0
    );

    // Thống kê phạt và quá hạn
    const libraryStats = computed(() => store.getters["borrow/libraryStatistics"]);
    const currentOverdueCount = computed(() => libraryStats.value?.soSachDangQuaHan || 0);
    const totalOverdueReturns = computed(() => libraryStats.value?.tongSoLanTraTre || 0);
    const totalPenalty = computed(() => libraryStats.value?.tongTienPhat || 0);
    const totalReturned = computed(() => libraryStats.value?.tongSoSachDaTra || 0);

    // Thống kê bổ sung
    const totalReaders = computed(() => {
      const requests = store.getters["borrow/allBorrowRequests"];
      const readerIds = new Set(requests.map(req => req.maDocGia?._id).filter(Boolean));
      return readerIds.size;
    });

    const availableBooks = computed(() => {
      const books = store.getters["book/allBooks"];
      return books.reduce((sum, book) => sum + (book.soQuyen || 0), 0);
    });

    const pendingRequests = computed(
      () =>
        store.getters["borrow/allBorrowRequests"]?.filter(
          (req) => req.trangThai === "Chờ duyệt"
        ).length || 0
    );

    // Tỷ lệ trả đúng hạn
    const onTimeReturnRate = computed(() => {
      const totalReturns = totalReturned.value;
      if (totalReturns === 0) return 100;
      const onTimeReturns = totalReturns - totalOverdueReturns.value;
      return Math.round((onTimeReturns / totalReturns) * 100);
    });

    const lateReturnRate = computed(() => {
      return 100 - onTimeReturnRate.value;
    });

    // Trung bình phạt mỗi lần
    const averagePenalty = computed(() => {
      if (totalOverdueReturns.value === 0) return 0;
      return totalPenalty.value / totalOverdueReturns.value;
    });

    const loading = computed(
      () =>
        store.getters["book/isLoading"] ||
        store.getters["author/isLoading"] ||
        store.getters["publisher/isLoading"] ||
        store.getters["borrow/isLoading"]
    );

    const error = computed(
      () =>
        store.getters["book/error"] ||
        store.getters["author/error"] ||
        store.getters["publisher/error"] ||
        store.getters["borrow/error"]
    );

    // Lấy tất cả dữ liệu cần thiết
    const fetchData = async () => {
      try {
        await Promise.all([
          store.dispatch("book/fetchBooks"),
          store.dispatch("author/fetchAuthors"),
          store.dispatch("publisher/fetchPublishers"),
          store.dispatch("borrow/fetchBorrowRequests"),
          store.dispatch("borrow/fetchLibraryStatistics"),
        ]);
      } catch (error) {
        showError(error.message);
      }
    };

    const formatCurrency = (value) => {
      if (!value) return "0 ₫";
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    };

    const clearError = () => {
      store.commit("book/SET_ERROR", null);
      store.commit("author/SET_ERROR", null);
      store.commit("publisher/SET_ERROR", null);
      store.commit("borrow/SET_ERROR", null);
    };

    onMounted(fetchData);

    return {
      totalBooks,
      totalAuthors,
      totalPublishers,
      totalBorrowedBooks,
      currentOverdueCount,
      totalOverdueReturns,
      totalPenalty,
      totalReturned,
      totalReaders,
      availableBooks,
      pendingRequests,
      onTimeReturnRate,
      lateReturnRate,
      averagePenalty,
      loading,
      error,
      formatCurrency,
      clearError,
    };
  },
};
</script>

<style scoped>
.admin-home-page {
  padding: 20px 0;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e3f2fd; 
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card.border-warning {
  border-color: #ffc107 !important;
  border-width: 2px;
}

.card.border-danger {
  border-color: #dc3545 !important;
  border-width: 2px;
}

.card.border-success {
  border-color: #198754 !important;
  border-width: 2px;
}

.card.border-secondary {
  border-color: #6c757d !important;
  border-width: 2px;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.card-title {
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
}

.card-text {
  font-size: 0.95rem;
  color: #6c757d;
  font-weight: 500;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  padding: 16px 20px;
  border-radius: 12px 12px 0 0;
}

.card-header h5 {
  color: #495057;
  font-weight: 600;
}

.progress {
  height: 8px;
  border-radius: 4px;
  background-color: #e9ecef;
}

.progress-bar {
  border-radius: 4px;
}

.stat-item {
  font-size: 0.95rem;
}

.btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.alert {
  border-radius: 10px;
  font-size: 0.95rem;
  padding: 12px 16px;
}

h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #343a40;
  margin-bottom: 30px;
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #495057;
}

hr {
  margin: 8px 0;
  opacity: 0.3;
}

small {
  font-size: 0.8rem;
}

.fw-bold {
  font-weight: 600 !important;
}
</style>