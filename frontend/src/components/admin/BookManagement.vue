<template>
  <div class="book-management">
    <LoadingSpinner :show="loading" />

    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Quản lý sách</h2>
      <button class="btn btn-primary" @click="showAddModal = true">
        <i class="fas fa-plus"></i> Thêm sách mới
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

    <!-- Search Box -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            v-model="searchTerm"
            placeholder="Tìm kiếm sách theo tên sách, mã sách, tên nhà xuất bản"
            @input="searchBooks"
          />
          <button
            class="btn btn-outline-secondary"
            type="button"
            @click="searchBooks"
          >
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Books Table -->
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Hình ảnh</th>
            <th>Mã sách</th>
            <th>Tên sách</th>
            <th>Nhà xuất bản</th>
            <th>Tác giả</th>
            <th>Đơn giá</th>
            <th>Số quyển</th>
            <th>Năm XB</th>
            <th>Nguồn gốc</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in filteredBooks" :key="book._id">
            <td>
              <!-- <div>{{ book.imagePath }}</div> -->
              <img
                :src="`${API_URL}/${
                  book.imagePath || 'uploads/default-book.jpg'
                }`"
                style="max-width: 100px"
                alt="Book cover"
              />
            </td>

            <td>{{ book.maSach }}</td>
            <td>{{ book.tenSach }}</td>
            <td>{{ book.maNXB?.tenNXB || "N/A" }}</td>
            <td>{{ book.maTacGia?.tenTacGia || "N/A" }}</td>
            <td>{{ formatCurrency(book.donGia) }}</td>
            <td :class="getQuantityClass(book.soQuyen)">
              {{ book.soQuyen }}
              <br />
              <small v-if="book.soQuyen <= 3" class="text-muted">
                {{ getQuantityMessage(book.soQuyen) }}
              </small>
            </td>
            <td>{{ book.namXuatBan }}</td>
            <td>{{ book.nguonGoc }}</td>
            <td>
              <button class="btn btn-sm btn-info me-2" @click="editBook(book)">
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="btn btn-sm btn-danger"
                @click="confirmDelete(book)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showAddModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editingBook ? "Sửa thông tin sách" : "Thêm sách mới" }}
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit" novalidate>
              <div class="mb-3">
                <label class="form-label"
                  >Mã sách <span class="text-danger">*</span></label
                >
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.maSach }"
                  v-model="bookForm.maSach"
                  required
                  @input="validateField('maSach')"
                />
                <div class="invalid-feedback" v-if="errors.maSach">
                  {{ errors.maSach }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label"
                  >Tên sách <span class="text-danger">*</span></label
                >
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.tenSach }"
                  v-model="bookForm.tenSach"
                  required
                  @input="validateField('tenSach')"
                />
                <div class="invalid-feedback" v-if="errors.tenSach">
                  {{ errors.tenSach }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label"
                  >Nhà xuất bản <span class="text-danger">*</span></label
                >
                <select
                  class="form-select"
                  :class="{ 'is-invalid': errors.maNXB }"
                  v-model="bookForm.maNXB"
                  required
                  @change="validateField('maNXB')"
                >
                  <option value="">Chọn nhà xuất bản</option>
                  <option
                    v-for="publisher in publishers"
                    :key="publisher._id"
                    :value="publisher._id"
                  >
                    {{ publisher.tenNXB }}
                  </option>
                </select>
                <div class="invalid-feedback" v-if="errors.maNXB">
                  {{ errors.maNXB }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label"
                  >Tác giả <span class="text-danger">*</span></label
                >
                <select
                  class="form-select"
                  :class="{ 'is-invalid': errors.maTacGia }"
                  v-model="bookForm.maTacGia"
                  required
                  @change="validateField('maTacGia')"
                >
                  <option value="">Chọn tác giả</option>
                  <option
                    v-for="author in authors"
                    :key="author._id"
                    :value="author._id"
                  >
                    {{ author.tenTacGia }}
                  </option>
                </select>
                <div class="invalid-feedback" v-if="errors.maTacGia">
                  {{ errors.maTacGia }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label"
                  >Đơn giá <span class="text-danger">*</span></label
                >
                <input
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors.donGia }"
                  v-model.number="bookForm.donGia"
                  min="0"
                  required
                  @input="validateField('donGia')"
                />
                <div class="invalid-feedback" v-if="errors.donGia">
                  {{ errors.donGia }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label"
                  >Số quyển <span class="text-danger">*</span></label
                >
                <input
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors.soQuyen }"
                  v-model.number="bookForm.soQuyen"
                  min="0"
                  required
                  @input="validateField('soQuyen')"
                />
                <div class="invalid-feedback" v-if="errors.soQuyen">
                  {{ errors.soQuyen }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label"
                  >Năm xuất bản <span class="text-danger">*</span></label
                >
                <input
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors.namXuatBan }"
                  v-model.number="bookForm.namXuatBan"
                  min="1900"
                  :max="new Date().getFullYear()"
                  required
                  @input="validateField('namXuatBan')"
                />
                <div class="invalid-feedback" v-if="errors.namXuatBan">
                  {{ errors.namXuatBan }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label"
                  >Nguồn gốc <span class="text-danger">*</span></label
                >
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.nguonGoc }"
                  v-model="bookForm.nguonGoc"
                  required
                  @input="validateField('nguonGoc')"
                />
                <div class="invalid-feedback" v-if="errors.nguonGoc">
                  {{ errors.nguonGoc }}
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Hình ảnh bìa sách</label>
                <input
                  type="file"
                  class="form-control"
                  @change="handleImageUpload"
                  accept="image/*"
                />
              </div>

              <div class="text-end">
                <button
                  type="button"
                  class="btn btn-secondary me-2"
                  @click="closeModal"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="loading || Object.keys(errors).length > 0"
                >
                  {{
                    loading
                      ? "Đang xử lý..."
                      : editingBook
                      ? "Cập nhật"
                      : "Thêm mới"
                  }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showAddModal"></div>

    <!-- Delete Confirmation Modal -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showDeleteModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận xóa</h5>
            <button
              type="button"
              class="btn-close"
              @click="showDeleteModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <p>
              Bạn có chắc chắn muốn xóa sách "{{ selectedBook?.tenSach }}"
              không?
            </p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showDeleteModal = false"
            >
              Hủy
            </button>
            <button
              type="button"
              class="btn btn-danger"
              @click="handleDelete"
              :disabled="loading"
            >
              {{ loading ? "Đang xử lý..." : "Xóa" }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showDeleteModal"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { showError, showSuccess } from "@/utils/notifications";
import api from "@/services/api";

export default {
  name: "BookManagement",
  components: { LoadingSpinner },

  setup() {
    const store = useStore();
    const showAddModal = ref(false);
    const showDeleteModal = ref(false);
    const editingBook = ref(null);
    const selectedBook = ref(null);
    const errors = ref({});
    const searchTerm = ref("");
    const imagePath = ref(null);
    const API_URL = import.meta.env.VITE_API_IMAGE_URL;

    const bookForm = ref({
      maSach: "",
      tenSach: "",
      maNXB: "",
      maTacGia: "",
      donGia: null,
      soQuyen: null,
      namXuatBan: new Date().getFullYear(),
      nguonGoc: "",
    });

    const loading = computed(() => store.getters["book/isLoading"]);
    const error = computed(() => store.getters["book/error"]);
    const books = computed(() => store.getters["book/allBooks"]);
    const publishers = computed(() => store.getters["publisher/allPublishers"]);
    const authors = computed(() => store.getters["author/allAuthors"]);

    const filteredBooks = computed(() => {
      if (!searchTerm.value) return books.value;
      const search = searchTerm.value.toLowerCase();
      return books.value.filter(
        (book) =>
          book.maSach.toLowerCase().includes(search) ||
          book.tenSach.toLowerCase().includes(search) ||
          book.maNXB?.tenNXB?.toLowerCase().includes(search) ||
          book.maTacGia?.tenTacGia?.toLowerCase().includes(search) ||
          book.nguonGoc.toLowerCase().includes(search)
      );
    });

    const validateField = async (field) => {
      const newErrors = { ...errors.value };
      const currentYear = new Date().getFullYear();

      if (field === "maSach") {
        if (!bookForm.value.maSach) {
          newErrors.maSach = "Mã sách là bắt buộc";
        } else {
          delete newErrors.maSach;
        }
      }

      if (field === "tenSach") {
        if (!bookForm.value.tenSach) {
          newErrors.tenSach = "Tên sách là bắt buộc";
        } else {
          delete newErrors.tenSach;
        }
      }

      if (field === "maNXB") {
        if (!bookForm.value.maNXB) {
          newErrors.maNXB = "Nhà xuất bản là bắt buộc";
        } else {
          delete newErrors.maNXB;
        }
      }

      if (field === "maTacGia") {
        if (!bookForm.value.maTacGia) {
          newErrors.maTacGia = "Tác giả là bắt buộc";
        } else {
          delete newErrors.maTacGia;
        }
      }

      if (field === "donGia") {
        if (bookForm.value.donGia === null || bookForm.value.donGia === "") {
          newErrors.donGia = "Đơn giá là bắt buộc";
        } else if (bookForm.value.donGia < 0) {
          newErrors.donGia = "Đơn giá phải lớn hơn hoặc bằng 0";
        } else {
          delete newErrors.donGia;
        }
      }

      if (field === "soQuyen") {
        if (bookForm.value.soQuyen === null || bookForm.value.soQuyen === "") {
          newErrors.soQuyen = "Số quyển là bắt buộc";
        } else if (bookForm.value.soQuyen < 0) {
          newErrors.soQuyen = "Số quyển phải lớn hơn hoặc bằng 0";
        } else {
          delete newErrors.soQuyen;
        }
      }

      if (field === "namXuatBan") {
        if (!bookForm.value.namXuatBan) {
          newErrors.namXuatBan = "Năm xuất bản là bắt buộc";
        } else if (
          bookForm.value.namXuatBan < 1900 ||
          bookForm.value.namXuatBan > currentYear
        ) {
          newErrors.namXuatBan = `Năm xuất bản phải từ 1900 đến ${currentYear}`;
        } else {
          delete newErrors.namXuatBan;
        }
      }

      if (field === "nguonGoc") {
        if (!bookForm.value.nguonGoc) {
          newErrors.nguonGoc = "Nguồn gốc là bắt buộc";
        } else {
          delete newErrors.nguonGoc;
        }
      }

      errors.value = newErrors;
    };

    const validateForm = async () => {
      const newErrors = {};
      const currentYear = new Date().getFullYear();

      if (!bookForm.value.maSach) {
        newErrors.maSach = "Mã sách là bắt buộc";
      }
      if (!bookForm.value.tenSach) {
        newErrors.tenSach = "Tên sách là bắt buộc";
      }
      if (!bookForm.value.maNXB) {
        newErrors.maNXB = "Nhà xuất bản là bắt buộc";
      }
      if (!bookForm.value.maTacGia) {
        newErrors.maTacGia = "Tác giả là bắt buộc";
      }
      if (bookForm.value.donGia === null || bookForm.value.donGia === "") {
        newErrors.donGia = "Đơn giá là bắt buộc";
      } else if (bookForm.value.donGia < 0) {
        newErrors.donGia = "Đơn giá phải lớn hơn hoặc bằng 0";
      }
      if (bookForm.value.soQuyen === null || bookForm.value.soQuyen === "") {
        newErrors.soQuyen = "Số quyển là bắt buộc";
      } else if (bookForm.value.soQuyen < 0) {
        newErrors.soQuyen = "Số quyển phải lớn hơn hoặc bằng 0";
      }
      if (!bookForm.value.namXuatBan) {
        newErrors.namXuatBan = "Năm xuất bản là bắt buộc";
      } else if (
        bookForm.value.namXuatBan < 1900 ||
        bookForm.value.namXuatBan > currentYear
      ) {
        newErrors.namXuatBan = `Năm xuất bản phải từ 1900 đến ${currentYear}`;
      }
      if (!bookForm.value.nguonGoc) {
        newErrors.nguonGoc = "Nguồn gốc là bắt buộc";
      }

      errors.value = newErrors;
      return Object.keys(newErrors).length === 0;
    };

    const fetchData = async () => {
      try {
        await Promise.all([
          store.dispatch("book/fetchBooks"),
          store.dispatch("publisher/fetchPublishers"),
          store.dispatch("author/fetchAuthors"),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
        showError(error.message || "Lỗi khi tải dữ liệu");
      }
    };

    const closeModal = () => {
      showAddModal.value = false;
      editingBook.value = null;
      errors.value = {};
      bookForm.value = {
        maSach: "",
        tenSach: "",
        maNXB: "",
        maTacGia: "",
        donGia: null,
        soQuyen: null,
        namXuatBan: new Date().getFullYear(),
        nguonGoc: "",
      };
      imagePath.value = null;
    };

    const getQuantityClass = (quantity) => {
      if (quantity === 0) return "text-danger fw-bold";
      if (quantity < 3) return "text-warning fw-bold";
      return "text-success";
    };

    const getQuantityMessage = (quantity) => {
      if (quantity === 0) return "Hết sách";
      if (quantity < 3) return "Sắp hết sách";
      return "";
    };

    const editBook = (book) => {
      editingBook.value = book;
      bookForm.value = {
        ...book,
        maNXB: book.maNXB?._id || book.maNXB || "",
        maTacGia: book.maTacGia?._id || book.maTacGia || "",
        donGia: book.donGia ?? null,
        soQuyen: book.soQuyen ?? null,
        imagePath: book.imagePath || "default-book.jpg",
      };
      showAddModal.value = true;
    };

    const confirmDelete = (book) => {
      selectedBook.value = book;
      showDeleteModal.value = true;
    };

    const handleDelete = async () => {
      try {
        await store.dispatch("book/deleteBook", selectedBook.value._id);
        await fetchData();
        showDeleteModal.value = false;
        selectedBook.value = null;
        showSuccess("Xóa sách thành công");
      } catch (error) {
        console.error("Error deleting book:", error);
        showError(error.message || "Lỗi khi xóa sách");
      }
    };

    const handleSubmit = async () => {
      const isValid = await validateForm();
      if (!isValid) {
        return;
      }

      try {
        const formData = new FormData();
        formData.append("maSach", bookForm.value.maSach);
        formData.append("tenSach", bookForm.value.tenSach);
        formData.append("maNXB", bookForm.value.maNXB);
        formData.append("maTacGia", bookForm.value.maTacGia);
        formData.append("donGia", bookForm.value.donGia);
        formData.append("soQuyen", bookForm.value.soQuyen);
        formData.append("namXuatBan", bookForm.value.namXuatBan);
        formData.append("nguonGoc", bookForm.value.nguonGoc);
        if (imagePath.value) {
          formData.append("image", imagePath.value); // 'image' phải khớp tên middleware upload.single('image')
        }

        console.log("Submitting book:", FormData);
        if (editingBook.value) {
          await store.dispatch("book/updateBook", {
            id: editingBook.value._id,
            bookData: formData,
          });
          showSuccess("Cập nhật sách thành công");
        } else {
          const response = await store.dispatch("book/createBook", formData);
          console.log("API response:", response);
          showSuccess("Thêm sách mới thành công");
        }
        await fetchData();
        closeModal();
      } catch (error) {
        console.error("Error submitting book:", error);
        let errorMessage =
          error.response?.data?.error || error.message || "Lỗi khi lưu sách";
        if (error.response?.data?.code === 11000) {
          errorMessage = "Mã sách đã tồn tại";
          errors.value.maSach = errorMessage;
        } else if (error.response?.data?.errors?.maTacGia) {
          errorMessage = "Tác giả là bắt buộc";
          errors.value.maTacGia = errorMessage;
        }
        showError(errorMessage);
        if (error.response?.data?.errors) {
          errors.value = { ...errors.value, ...error.response.data.errors };
        }
      }
    };

    const handleImageUpload = (event) => {
      imagePath.value = event.target.files[0];
    };

    const formatCurrency = (value) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    };

    const clearError = () => {
      store.commit("book/SET_ERROR", null);
    };

    const searchBooks = () => {
      searchTerm.value = searchTerm.value.trim();
    };

    onMounted(fetchData);

    return {
      showAddModal,
      showDeleteModal,
      editingBook,
      selectedBook,
      bookForm,
      loading,
      getQuantityClass,
      getQuantityMessage,
      error,
      errors,
      books,
      publishers,
      authors,
      searchTerm,
      filteredBooks,
      closeModal,
      editBook,
      confirmDelete,
      handleDelete,
      handleSubmit,
      formatCurrency,
      clearError,
      validateField,
      searchBooks,
      handleImageUpload,
      API_URL,
    };
  },
};
</script>

<style scoped>
/* Modal overlay */
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

/* Label */
.form-label {
  font-weight: 500;
  color: #37474f;
}

/* Số lượng cảnh báo */
.text-danger {
  font-weight: bold;
  background-color: rgba(244, 67, 54, 0.1); /* đỏ cảnh báo nhẹ */
  color: #d32f2f !important;
}
.text-warning {
  background-color: rgba(255, 193, 7, 0.12); /* vàng nhẹ */
  color: #f57c00 !important;
}
.text-success {
  color: #2e7d32 !important;
}

/* Mô tả phụ */
.text-muted {
  font-size: 0.85em;
  font-style: italic;
  color: #78909c;
}

/* Nút Thêm sách mới */
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

/* Nút nhỏ (sửa, xóa) */
.btn-sm {
  border-radius: 4px;
}

/* Input & select chung */
.form-control,
.form-select {
  border-radius: 6px;
  border: 1px solid #cfd8dc;
  transition: border-color 0.2s ease;
  font-size: 0.95rem;
}

.form-control:focus,
.form-select:focus {
  border-color: #4fc3f7;
  box-shadow: 0 0 0 2px rgba(79, 195, 247, 0.1);
  outline: none;
}

/* Bảng */
.table {
  font-size: 0.95rem;
  border-collapse: collapse;
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

/* Ảnh bìa sách */
img {
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}
</style>
