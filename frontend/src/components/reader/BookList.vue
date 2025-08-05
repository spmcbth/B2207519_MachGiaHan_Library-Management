<template>
  <div class="book-list">
    <LoadingSpinner :show="loading" />

    <h2>Danh sách sách</h2>

    <div
      v-if="error"
      class="alert alert-danger alert-dismissible fade show"
      role="alert"
    >
      {{ error }}
      <button type="button" class="btn-close" @click="clearError"></button>
    </div>

    <!-- Confirmation Modal -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showConfirmModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận mượn sách</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeConfirmModal"
            ></button>
          </div>
          <div class="modal-body">
            <p>Bạn muốn mượn '{{ selectedBook?.tenSach }}'?</p>
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
              class="btn btn-primary"
              @click="handleConfirmBorrow"
              :disabled="loading"
            >
              {{ loading ? "Đang xử lý..." : "Mượn sách" }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showConfirmModal"></div>

    <!-- Tìm kiếm -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            v-model="searchTerm"
            placeholder="Tìm kiếm theo tên sách, mã sách, tên NXB, tên tác giả"
          />
          <span class="input-group-text">
            <i class="fas fa-search"></i>
          </span>
        </div>
      </div>
    </div>

    <!-- Danh sách sách -->
    <div class="row row-cols-1 row-cols-md-3 g-4">
      <div class="col" v-for="book in books" :key="book._id">
        <div class="card h-100">
          <div class="card-img-top" style="height: 200px; overflow: hidden">
            <img
              :src="`${API_URL}/${
                book.imagePath || 'uploads/default-book.jpg'
              }`"
              style="width: 100%; height: 100%; object-fit: cover"
              alt="Book cover"
            />
          </div>
          <div class="card-body">
            <h5 class="card-title">{{ book.tenSach }}</h5>
            <p class="card-text">
              <small class="text-muted">Mã sách: {{ book.maSach }}</small>
            </p>
            <p class="card-text">
              <strong>Nhà xuất bản:</strong> {{ book.maNXB?.tenNXB }}
            </p>
            <p class="card-text">
              <strong>Năm xuất bản:</strong> {{ book.namXuatBan }}
            </p>
            <p class="card-text">
              <strong>Tác giả:</strong>
              {{ book.maTacGia?.tenTacGia || "Chưa có tác giả" }}
            </p>
            <p class="card-text">
              <strong>Nguồn gốc:</strong> {{ book.nguonGoc }}
            </p>
            <p class="card-text">
              <strong>Số quyển còn:</strong>
              <span
                :class="{
                  'text-danger fw-bold': book.soQuyen === 0,
                  'text-warning fw-bold': book.soQuyen > 0 && book.soQuyen < 3,
                  'text-success': book.soQuyen >= 3,
                }"
                >{{ book.soQuyen }}</span
              >
              <br />
              <small class="text-muted" v-if="book.soQuyen < 3">
                {{ book.soQuyen === 0 ? "Hết sách" : "Sắp hết sách" }}
              </small>
            </p>
          </div>
          <div class="card-footer">
            <button
              class="btn btn-primary"
              @click="borrowBook(book._id)"
              :disabled="book.soQuyen === 0 || loading"
            >
              {{ loading ? "Đang xử lý..." : "Mượn sách" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, getCurrentInstance } from "vue";
import { useStore } from "vuex";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { showSuccess, showError } from "@/utils/notifications";

export default {
  name: "BookList",
  components: { LoadingSpinner },
  setup() {
    const { proxy } = getCurrentInstance();
    const error = ref(null);
    const loading = ref(false);
    const searchTerm = ref("");
    const selectedBook = ref(null);
    const selectedBookId = ref(null);
    const showConfirmModal = ref(false);
    const store = useStore();
    const API_URL = import.meta.env.VITE_API_IMAGE_URL;
    const allBooks = computed(() => store.getters["book/allBooks"]);

    const books = computed(() => {
      if (!searchTerm.value) return allBooks.value;

      const search = searchTerm.value.toLowerCase().trim();
      return allBooks.value.filter(
        (book) =>
          book.tenSach.toLowerCase().includes(search) ||
          book.maSach.toLowerCase().includes(search) ||
          book.maNXB?.tenNXB.toLowerCase().includes(search) ||
          book.nguonGoc.toLowerCase().includes(search) ||
          (book.maTacGia?.tenTacGia &&
            book.maTacGia.tenTacGia.toLowerCase().includes(search))
      );
    });

    const fetchBooks = async () => {
      try {
        loading.value = true;
        await store.dispatch("book/fetchBooks");
        // books.value = store.getters['book/allBooks'];
      } catch (err) {
        error.value = err.message;
        console.error("Error fetching books:", err);
      } finally {
        loading.value = false;
      }
    };

    const borrowBook = (bookId) => {
      selectedBook.value = books.value.find((book) => book._id === bookId);
      selectedBookId.value = bookId;
      showConfirmModal.value = true;
    };

    const closeConfirmModal = () => {
      showConfirmModal.value = false;
      selectedBookId.value = null;
      selectedBook.value = null;
    };

    const handleConfirmBorrow = async () => {
      try {
        loading.value = true;
        await store.dispatch(
          "borrow/createBorrowRequest",
          selectedBookId.value
        );
        proxy.$toast.show(
          "Yêu cầu mượn sách đã được gửi. Vui lòng chờ quản lý duyệt!",
          "success"
        );
        closeConfirmModal();
        await fetchBooks();
      } catch (error) {
        proxy.$toast.show(
          error.response?.data?.message || "Có lỗi xảy ra",
          "danger"
        );
      } finally {
        loading.value = false;
      }
    };

    const clearError = () => {
      error.value = null;
      store.commit("book/SET_ERROR", null);
    };

    onMounted(fetchBooks);

    return {
      books,
      loading,
      error,
      searchTerm,
      borrowBook,
      showConfirmModal,
      closeConfirmModal,
      handleConfirmBorrow,
      selectedBook,
      clearError,
      API_URL,
    };
  },
};
</script>

<style scoped>
.card-title {
  font-size: 1.1rem;
}
.card-footer {
  background-color: transparent;
  border-top: none;
  padding-top: 0;
}
.input-group {
  max-width: 500px;
}
.input-group-text {
  background-color: white;
  border-left: none;
}
.form-control:focus + .input-group-text {
  border-color: #86b7fe;
}
.form-control {
  border-right: none;
  border-radius: 6px;
  border: 1px solid #cfd8dc;
  transition: border-color 0.2s ease;
  font-size: 0.95rem;
}
.form-control:focus {
  border-color: #4fc3f7;
  box-shadow: 0 0 0 2px rgba(79, 195, 247, 0.1);
  outline: none;
}
.text-danger {
  font-weight: bold;
  background-color: rgba(244, 67, 54, 0.1);
  color: #d32f2f !important;
}
.text-warning {
  background-color: rgba(255, 193, 7, 0.12);
  color: #f57c00 !important;
}
.text-success {
  color: #2e7d32 !important;
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
