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

    <div class="row row-cols-1 row-cols-md-3 g-4">
      <div class="col" v-for="publisher in publishers" :key="publisher._id">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ publisher.tenNXB }}</h5>
            <p class="card-text">
              <small class="text-muted">Mã NXB: {{ publisher.maNXB }}</small>
            </p>
            <p class="card-text">
              <strong>Địa chỉ:</strong> {{ publisher.diaChi }}
            </p>
            <p class="card-text">
              <strong>Số sách đã xuất bản:</strong>
              {{ getPublisherBookCount(publisher._id) }}
            </p>
          </div>
          <div class="card-footer">
            <button
              class="btn btn-primary"
              @click="showPublisherBooks(publisher)"
            >
              Xem danh sách sách
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal" tabindex="-1" :class="{ 'd-block': showBooksModal }">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
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
.card {
  transition: transform 0.2s;
}
.card:hover {
  transform: translateY(-5px);
}
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
