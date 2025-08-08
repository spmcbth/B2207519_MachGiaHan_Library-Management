<template>
  <div class="overdue-books">
    <LoadingSpinner :show="loading" />

    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Sách đang quá hạn</h2>
      <button class="btn btn-primary" @click="fetchOverdueBooks">
        <i class="fas fa-sync-alt"></i> Làm mới
      </button>
    </div>

    <!-- Error Alert -->
    <div
      v-if="error"
      class="alert alert-danger alert-dismissible fade show"
      role="alert"
    >
      {{ error }}
      <button type="button" class="btn-close" @click="clearError"></button>
    </div>

    <!-- Thống kê tóm tắt -->
    <div class="row mb-4">
      <div class="col-md-4">
        <div class="card border-danger">
          <div class="card-body text-center">
            <h3 class="text-danger">{{ overdueBooks.length }}</h3>
            <p class="text-muted mb-0">Sách đang quá hạn</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-warning">
          <div class="card-body text-center">
            <h3 class="text-warning">{{ totalEstimatedPenalty }}</h3>
            <p class="text-muted mb-0">Tổng phạt dự kiến</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-info">
          <div class="card-body text-center">
            <h3 class="text-info">{{ averageOverdueDays.toFixed(1) }}</h3>
            <p class="text-muted mb-0">Trung bình ngày quá hạn</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Danh sách sách quá hạn -->
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Độc giả</th>
            <th>Sách</th>
            <th>Ngày hẹn trả</th>
            <th>Số ngày quá hạn</th>
            <th>Phạt dự kiến</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in sortedOverdueBooks" :key="book._id">
            <td>
              <strong>{{ getReaderName(book.maDocGia) }}</strong
              ><br />
              <small class="text-muted">
                Mã: {{ book.maDocGia?.maDocGia || "N/A" }}
                <span v-if="book.maDocGia?.email">
                  <br />Email: {{ book.maDocGia.email }}
                </span>
                <span v-if="book.maDocGia?.soDienThoai">
                  <br />SĐT: {{ book.maDocGia.soDienThoai }}
                </span>
              </small>
            </td>
            <td>
              <strong>{{ book.maSach?.tenSach || "N/A" }}</strong
              ><br />
              <small class="text-muted">
                Mã sách: {{ book.maSach?.maSach || "N/A" }}
              </small>
            </td>
            <td>
              {{ formatDate(book.ngayHenTra) }}
            </td>
            <td>
              <span class="badge bg-danger fs-6">
                {{ book.soNgayQuaHan }} ngày
              </span>
            </td>
            <td>
              <span class="text-danger fw-bold">
                {{ formatCurrency(book.tienPhatDuKien) }}
              </span>
            </td>
            <td>
              <button
                class="btn btn-sm btn-info me-2"
                @click="markAsReturned(book._id)"
                :disabled="loading"
              >
                <i class="fas fa-undo"></i> Đánh dấu đã trả
              </button>
              <button
                class="btn btn-sm btn-warning"
                @click="sendReminder(book)"
                :disabled="loading"
              >
                <i class="fas fa-bell"></i> Nhắc nhở
              </button>
            </td>
          </tr>
          <tr v-if="overdueBooks.length === 0 && !loading">
            <td colspan="6" class="text-center text-muted py-4">
              <i class="fas fa-check-circle fa-2x mb-2 text-success"></i><br />
              Không có sách nào đang quá hạn
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal nhắc nhở -->
    <div
      class="modal fade"
      id="reminderModal"
      tabindex="-1"
      v-if="selectedBook"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Gửi nhắc nhở trả sách</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <p>
              <strong>Độc giả:</strong>
              {{ getReaderName(selectedBook.maDocGia) }}
            </p>
            <p><strong>Sách:</strong> {{ selectedBook.maSach?.tenSach }}</p>
            <p>
              <strong>Quá hạn:</strong>
              <span class="text-danger"
                >{{ selectedBook.soNgayQuaHan }} ngày</span
              >
            </p>
            <p>
              <strong>Phạt dự kiến:</strong>
              <span class="text-danger">{{
                formatCurrency(selectedBook.tienPhatDuKien)
              }}</span>
            </p>
            <div class="mb-3">
              <label class="form-label">Nội dung nhắc nhở:</label>
              <textarea
                class="form-control"
                v-model="reminderMessage"
                rows="4"
                placeholder="Nhập nội dung nhắc nhở..."
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Hủy
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="sendReminderMessage"
              :disabled="!reminderMessage.trim()"
            >
              <i class="fas fa-paper-plane"></i> Gửi nhắc nhở
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { showSuccess, showError } from "@/utils/notifications";

export default {
  name: "OverdueBooks",
  components: { LoadingSpinner },
  setup() {
    const store = useStore();
    const loading = ref(false);
    const error = ref(null);
    const selectedBook = ref(null);
    const reminderMessage = ref("");

    const overdueBooks = computed(
      () => store.getters["borrow/currentOverdueBooks"]
    );

    // Sắp xếp theo số ngày quá hạn giảm dần
    const sortedOverdueBooks = computed(() => {
      return [...overdueBooks.value].sort(
        (a, b) => b.soNgayQuaHan - a.soNgayQuaHan
      );
    });

    // Tổng phạt dự kiến
    const totalEstimatedPenalty = computed(() => {
      const total = overdueBooks.value.reduce(
        (sum, book) => sum + book.tienPhatDuKien,
        0
      );
      return formatCurrency(total);
    });

    // Trung bình ngày quá hạn
    const averageOverdueDays = computed(() => {
      if (overdueBooks.value.length === 0) return 0;
      const totalDays = overdueBooks.value.reduce(
        (sum, book) => sum + book.soNgayQuaHan,
        0
      );
      return totalDays / overdueBooks.value.length;
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

    const getReaderName = (reader) => {
      if (!reader) return "N/A";
      return `${reader.hoLot || ""} ${reader.ten || ""}`.trim() || "N/A";
    };

    const fetchOverdueBooks = async () => {
      loading.value = true;
      try {
        await store.dispatch("borrow/fetchCurrentOverdueBooks");
      } catch (err) {
        error.value = err.message;
        showError(err);
      } finally {
        loading.value = false;
      }
    };

    const markAsReturned = async (requestId) => {
      try {
        await store.dispatch("borrow/updateBorrowStatus", {
          id: requestId,
          status: "Đã trả",
        });
        showSuccess("Đã đánh dấu sách đã được trả");
        await fetchOverdueBooks(); // Làm mới danh sách
      } catch (err) {
        showError(err);
      }
    };

    const sendReminder = (book) => {
      selectedBook.value = book;
      reminderMessage.value = `Kính gửi ${getReaderName(book.maDocGia)},

Chúng tôi nhận thấy bạn đã mượn sách "${book.maSach?.tenSach}" quá hạn ${
        book.soNgayQuaHan
      } ngày kể từ ngày hẹn trả (${formatDate(book.ngayHenTra)}).

Phí phạt hiện tại: ${formatCurrency(book.tienPhatDuKien)}

Vui lòng trả sách sớm nhất có thể để tránh phí phạt tăng thêm.

Trân trọng,
Thư viện`;

      // Hiển thị modal (cần Bootstrap JS)
      const modal = new window.bootstrap.Modal(
        document.getElementById("reminderModal")
      );
      modal.show();
    };

    const sendReminderMessage = async () => {
      try {
        // Ở đây bạn có thể gọi API gửi email/SMS nhắc nhở
        // Hiện tại chỉ hiển thị thông báo thành công
        showSuccess("Đã gửi nhắc nhở đến độc giả");

        // Đóng modal
        const modal = window.bootstrap.Modal.getInstance(
          document.getElementById("reminderModal")
        );
        modal.hide();

        // Reset
        selectedBook.value = null;
        reminderMessage.value = "";
      } catch (err) {
        showError("Có lỗi xảy ra khi gửi nhắc nhở");
      }
    };

    const clearError = () => {
      error.value = null;
      store.commit("borrow/SET_ERROR", null);
    };

    onMounted(fetchOverdueBooks);

    return {
      overdueBooks,
      sortedOverdueBooks,
      totalEstimatedPenalty,
      averageOverdueDays,
      loading,
      error,
      selectedBook,
      reminderMessage,
      formatDate,
      formatCurrency,
      getReaderName,
      fetchOverdueBooks,
      markAsReturned,
      sendReminder,
      sendReminderMessage,
      clearError,
    };
  },
};
</script>

<style scoped>
.overdue-books {
  padding: 20px 0;
}

.card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
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
.btn-sm {
  padding: 4px 8px;
  font-size: 0.875rem;
}

.badge {
  font-size: 0.875em;
  padding: 0.5em 0.75em;
}

.text-danger {
  color: #dc3545 !important;
}

.text-warning {
  color: #ffc107 !important;
}

.text-info {
  color: #17a2b8 !important;
}

.fw-bold {
  font-weight: 700 !important;
}

.modal-content {
  border-radius: 12px;
  border: none;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.modal-header {
  border-bottom: 1px solid #e9ecef;
  padding: 20px 24px 16px;
}

.modal-body {
  padding: 20px 24px;
}

.modal-footer {
  border-top: 1px solid #e9ecef;
  padding: 16px 24px 20px;
}
</style>
