<template>
  <div class="publisher-list">
    <LoadingSpinner :show="loading" />

    <h2>Danh sách nhà xuất bản</h2>

    <div
      v-if="error"
      class="alert alert-danger alert-dismissible fade show"
      role="alert"
    >
      {{ error }}
      <button type="button" class="btn-close" @click="clearError"></button>
    </div>

    <!-- Tìm kiếm -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            v-model="searchTerm"
            placeholder="Tìm kiếm nhà xuất bản theo tên hoặc mã nhà xuất bản"
          />
          <span class="input-group-text">
            <i class="fas fa-search"></i>
          </span>
        </div>
      </div>
    </div>

    <!-- Danh sách NXB -->
    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
      <div class="col" v-for="publisher in publishers" :key="publisher._id">
        <div class="card h-100 info-card">
          <div class="card-body p-3">
            <h5 class="card-title">{{ publisher.tenNXB }}</h5>
            <p class="card-text small mb-2">
              <span class="text-muted">{{ publisher.maNXB }}</span>
            </p>
            <p class="card-text small mb-2">
              <strong>Địa chỉ:</strong> {{ publisher.diaChi }}
            </p>
            <p class="card-text small mb-2">
              <strong>Số sách: </strong>
              <span class="badge bg-primary">{{
                getPublisherBookCount(publisher._id)
              }}</span>
            </p>
          </div>
          <div class="card-footer p-3">
            <button
              class="btn btn-primary btn-sm w-100"
              @click="showPublisherBooks(publisher)"
            >
              <i class="fas fa-book me-1"></i>
              Xem danh sách sách
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Books -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showBooksModal }">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-building me-2"></i>
              Sách của {{ selectedPublisher?.tenNXB }}
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeBooksModal"
            ></button>
          </div>
          <div class="modal-body">
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Mã sách</th>
                    <th>Tên sách</th>
                    <th>Năm xuất bản</th>
                    <th>Số quyển</th>
                    <th>Đơn giá</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="book in publisherBooks" :key="book._id">
                    <td>{{ book.maSach }}</td>
                    <td>{{ book.tenSach }}</td>
                    <td>{{ book.namXuatBan }}</td>
                    <td>
                      <span
                        :class="{
                          'text-danger fw-bold': book.soQuyen === 0,
                          'text-warning fw-bold':
                            book.soQuyen > 0 && book.soQuyen < 3,
                          'text-success': book.soQuyen >= 3,
                        }"
                        >{{ book.soQuyen }}</span
                      >
                      <br />
                      <small class="text-muted" v-if="book.soQuyen < 3">
                        {{ book.soQuyen === 0 ? "Hết sách" : "Sắp hết sách" }}
                      </small>
                    </td>
                    <td>{{ formatCurrency(book.donGia) }}</td>
                  </tr>
                  <tr v-if="publisherBooks.length === 0">
                    <td colspan="5" class="text-center">Không có sách nào</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showBooksModal"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { showError } from "@/utils/notifications";

export default {
  name: "PublisherList",
  components: { LoadingSpinner },
  setup() {
    const store = useStore();
    const searchTerm = ref("");
    const showBooksModal = ref(false);
    const selectedPublisher = ref(null);

    const loading = computed(() => store.getters["publisher/isLoading"]);
    const error = computed(() => store.getters["publisher/error"]);
    const allPublishers = computed(
      () => store.getters["publisher/allPublishers"]
    );
    const allBooks = computed(() => store.getters["book/allBooks"]);

    const publishers = computed(() => {
      if (!searchTerm.value) return allPublishers.value;
      const search = searchTerm.value.toLowerCase();
      return allPublishers.value.filter(
        (pub) =>
          pub.tenNXB.toLowerCase().includes(search) ||
          pub.maNXB.toLowerCase().includes(search)
      );
    });

    const publisherBooks = computed(() => {
      if (!selectedPublisher.value) return [];
      return allBooks.value.filter(
        (book) => book.maNXB?._id === selectedPublisher.value._id
      );
    });

    const getPublisherBookCount = (publisherId) => {
      return allBooks.value.filter((book) => book.maNXB?._id === publisherId)
        .length;
    };

    const formatCurrency = (value) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    };

    const showPublisherBooks = (publisher) => {
      selectedPublisher.value = publisher;
      showBooksModal.value = true;
    };

    const closeBooksModal = () => {
      showBooksModal.value = false;
      selectedPublisher.value = null;
    };

    const clearError = () => {
      store.commit("publisher/SET_ERROR", null);
    };

    onMounted(async () => {
      try {
        await Promise.all([
          store.dispatch("publisher/fetchPublishers"),
          store.dispatch("book/fetchBooks"),
        ]);
      } catch (error) {
        showError(error);
      }
    });

    return {
      publishers,
      loading,
      error,
      searchTerm,
      showBooksModal,
      selectedPublisher,
      publisherBooks,
      clearError,
      showPublisherBooks,
      closeBooksModal,
      getPublisherBookCount,
      formatCurrency,
    };
  },
};
</script>

<style scoped>
/* Publisher Card Styles */
.info-card {
  max-width: 320px;
  margin: 0 auto;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e3f2fd;
}

.info-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-bottom: 1px solid #e1f5fe;
  padding: 1rem;
  text-align: center;
}

.publisher-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: white;
  font-size: 1.2rem;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #1565c0;
}

.small {
  font-size: 0.85rem;
}

/* .badge {
  font-size: 0.8rem;
} */

.card-footer {
  background-color: transparent;
  border-top: 1px solid rgba(0, 0, 0, 0.125);
}

/* Form Styles */
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

/* Button Styles */
.btn-primary {
  background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%);
  border: none;
  font-weight: 500;
  transition: all 0.2s ease;
  border-radius: 6px;
  font-size: 0.9rem;
  padding: 8px 16px;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #29b6f6 0%, #0288d1 100%);
  transform: translateY(-1px);
}

/* Modal Styles */
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.table thead th {
  background-color: #e1f5fe;
  color: #0277bd;
  font-weight: 600;
  vertical-align: middle;
}

.table-striped > tbody > tr:nth-child(odd) {
  background-color: #f8fbfc;
}

/* Status Colors */
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
  color: #6c757d !important;
}
</style>
