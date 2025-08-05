<template>
  <div class="author-management">
    <LoadingSpinner :show="loading" />
    <!-- Header section -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Quản lý tác giả</h2>
      <button class="btn btn-primary" @click="showAddModal = true">
        <i class="fas fa-plus"></i>
        Thêm tác giả
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

    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            v-model="searchTerm"
            placeholder="Tìm kiếm tác giả theo tên hoặc mã tác giả"
          />
          <span class="input-group-text">
            <i class="fas fa-search"></i>
          </span>
        </div>
      </div>
    </div>

    <!-- Danh sách tác giả -->
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Mã tác giả</th>
            <th>Tên tác giả</th>
            <th>Số điện thoại</th>
            <th>Địa chỉ</th>
            <th>Số sách đã xuất bản</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="author in authors" :key="author._id">
            <td>{{ author.maTacGia }}</td>
            <td>{{ author.tenTacGia }}</td>
            <td>{{ author.soDienThoai }}</td>
            <td>{{ author.diaChi }}</td>
            <td>{{ getAuthorBookCount(author._id) }}</td>
            <td>
              <button
                class="btn btn-sm btn-info me-2"
                @click="editAuthor(author)"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="btn btn-sm btn-danger"
                @click="confirmDelete(author)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Modal thêm/sửa tác giả -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showAddModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editingAuthor ? "Sửa thông tin tác giả" : "Thêm tác giả" }}
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
                <label for="maTacGia" class="form-label"
                  >Mã tác giả <span class="text-danger">*</span></label
                >
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.maTacGia }"
                  v-model="AuthorForm.maTacGia"
                  required
                />
                <div class="invalid-feedback" v-if="errors.maTacGia">
                  {{ errors.maTacGia }}
                </div>
              </div>
              <div class="mb-3">
                <label for="tenTacGia" class="form-label"
                  >Tên tác giả <span class="text-danger">*</span></label
                >
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.tenTacGia }"
                  v-model="AuthorForm.tenTacGia"
                  required
                />
                <div class="invalid-feedback" v-if="errors.tenTacGia">
                  {{ errors.tenTacGia }}
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Số điện thoại</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="AuthorForm.soDienThoai"
                />
              </div>
              <div class="mb-3">
                <label for="diaChi" class="form-label">Địa chỉ</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="AuthorForm.diaChi"
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
                  :disabled="loading"
                >
                  {{
                    loading
                      ? "Đang xử lý..."
                      : editingAuthor
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
    <!-- Modal xác nhận xóa tác giả -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showDeleteModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận xóa tác giả</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeDeteleModal"
            ></button>
          </div>
          <div class="modal-body">
            <p>
              Bạn có chắc chắn muốn xóa tác giả "<strong>{{
                selectedAuthor?.tenTacGia
              }}</strong
              >" không?
            </p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeDeteleModal"
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

    <div class="modal-backdrop fade show" v-if="showAddModal"></div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useStore } from "vuex";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { validateAuthorForm } from "@/utils/validation";
import { showError } from "@/utils/notifications";

export default {
  name: "AuthorManagement",
  components: { LoadingSpinner },
  setup() {
    const store = useStore();
    const showAddModal = ref(false);
    const editingAuthor = ref(null);
    const searchTerm = ref("");
    const showDeleteModal = ref(false);
    const selectedAuthor = ref(null);
    const AuthorForm = ref({
      maTacGia: "",
      tenTacGia: "",
      soDienThoai: "",
      diaChi: "",
    });
    const errors = ref({});

    const authors = computed(() => store.getters["author/allAuthors"]);
    const loading = computed(() => store.getters["author/isLoading"]);
    const error = computed(() => store.getters["author/error"]);

    const fetchAuthors = async () => {
      await store.dispatch("author/fetchAuthors");
    };
    const filteredAuthors = computed(() => {
      if (!searchTerm.value.trim()) return authors.value;
      const search = searchTerm.value.toLowerCase().trim();
      return authors.value.filter(
        (author) =>
          author.tenTacGia.toLowerCase().includes(search) ||
          author.maTacGia.toLowerCase().includes(search)
      );
    });
    const confirmDelete = (author) => {
      selectedAuthor.value = author;
      showDeleteModal.value = true;
    };
    const closeDeteleModal = () => {
      showDeleteModal.value = false;
      selectedAuthor.value = null;
    };

    const handleDelete = async () => {
      try {
        await store.dispatch("author/deleteAuthor", selectedAuthor.value._id);
        await fetchAuthors();
        closeDeteleModal();
        Proxy.$toast.show("Xoá tác giả thành công", "success");
      } catch (err) {
        showError("Lỗi khi xóa tác giả: " + err.message);
      }
    };
    const closeModal = () => {
      showAddModal.value = false;
      editingAuthor.value = null;
      AuthorForm.value = {
        maTacGia: "",
        tenTacGia: "",
        soDienThoai: "",
        diaChi: "",
      };
      errors.value = {};
    };
    const allBooks = computed(() => store.getters["book/allBooks"]);

    const getAuthorBookCount = (authorId) => {
      return allBooks.value.filter((book) => book.maTacGia?._id === authorId)
        .length;
    };
    const fetchData = async () => {
      try {
        await Promise.all([
          store.dispatch("author/fetchAuthors"),
          store.dispatch("book/fetchBooks"),
        ]);
      } catch (err) {
        showError("Lỗi khi tải dữ liệu: " + err.message);
      }
    };

    const editAuthor = (author) => {
      editingAuthor.value = author;
      AuthorForm.value = { ...author };
      showAddModal.value = true;
    };
    const handleSubmit = async () => {
      try {
        const { isValid, errors: validationErrors } = validateAuthorForm(
          AuthorForm.value
        );
        if (!isValid) {
          errors.value = validationErrors;
          return;
        }
        if (editingAuthor.value) {
          await store.dispatch("author/updateAuthor", {
            id: editingAuthor.value._id,
            authorData: AuthorForm.value,
          });
          Proxy.$toast.show("Cập nhật tác giả thành công", "success");
        } else {
          const response = await store.dispatch(
            "author/createAuthor",
            AuthorForm.value
          );
          console.log("Response from createAuthor:", response); // Log để kiểm tra
          Proxy.$toast.show("Thêm tác giả thành công", "success");
        }
        await fetchAuthors();
        closeModal();
      } catch (err) {
        console.error("Error details:", err.response?.data || err.message); // Log lỗi chi tiết
        showError("Lỗi khi lưu tác giả: " + err.message);
      }
    };
    const clearError = () => {
      store.commit("author/SET_ERROR", null);
    };

    onMounted(fetchAuthors);

    return {
      showAddModal,
      editingAuthor,
      AuthorForm,
      errors,
      loading: computed(() => store.getters["author/isLoading"]),
      error: computed(() => store.getters["author/error"]),
      authors: filteredAuthors,
      searchTerm,
      closeModal,
      editAuthor,
      handleSubmit,
      clearError,
      getAuthorBookCount,
      showDeleteModal,
      selectedAuthor,
      confirmDelete,
      closeDeteleModal,
      handleDelete,
    };
  },
};
</script>
<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.input-group {
  max-width: 400px;
}

.input-group-text {
  background-color: #ffffff;
  border-left: none;
  border-radius: 0 6px 6px 0;
  color: #4fc3f7;
}

.form-control {
  border-right: none;
  border-radius: 6px 0 0 6px;
  font-size: 0.95rem;
}

.form-control:focus {
  border-color: #4fc3f7;
  box-shadow: 0 0 0 2px rgba(79, 195, 247, 0.1);
  outline: none;
}

.form-control:focus + .input-group-text {
  border-color: #4fc3f7;
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

.btn-sm {
  border-radius: 4px;
}

/* Table style */
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

/* Label */
.form-label {
  font-weight: 500;
  color: #37474f;
}

/* Alert & Modal titles */
h2,
.modal-title {
  color: #37474f;
  font-weight: 600;
}
</style>
