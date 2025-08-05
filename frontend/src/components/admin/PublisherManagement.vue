<template>
  <div class="publisher-management">
    <LoadingSpinner :show="loading" />

    <!-- Header section -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Quản lý nhà xuất bản</h2>
      <button class="btn btn-primary" @click="showAddModal = true">
        <i class="fas fa-plus"></i> Thêm nhà xuất bản mới
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
            placeholder="Tìm kiếm theo mã NXB hoặc tên NXB"
          />
          <span class="input-group-text">
            <i class="fas fa-search"></i>
          </span>
        </div>
      </div>
    </div>

    <!-- Danh sách nhà xuất bản -->
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Mã NXB</th>
            <th>Tên NXB</th>
            <th>Địa chỉ</th>
            <th>Số sách đã xuất bản</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="publisher in publishers" :key="publisher._id">
            <td>{{ publisher.maNXB }}</td>
            <td>{{ publisher.tenNXB }}</td>
            <td>{{ publisher.diaChi }}</td>
            <td>{{ getPublisherBookCount(publisher._id) }}</td>
            <td>
              <button
                class="btn btn-sm btn-info me-2"
                @click="editPublisher(publisher)"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="btn btn-sm btn-danger"
                @click="confirmDelete(publisher)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal thêm/sửa nhà xuất bản -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showAddModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{
                editingPublisher
                  ? "Sửa thông tin nhà xuất bản"
                  : "Thêm nhà xuất bản mới"
              }}
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
                  >Mã NXB <span class="text-danger">*</span></label
                >
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.maNXB }"
                  v-model="publisherForm.maNXB"
                  required
                />
                <div class="invalid-feedback" v-if="errors.maNXB">
                  {{ errors.maNXB }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label"
                  >Tên NXB <span class="text-danger">*</span></label
                >
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.tenNXB }"
                  v-model="publisherForm.tenNXB"
                  required
                />
                <div class="invalid-feedback" v-if="errors.tenNXB">
                  {{ errors.tenNXB }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label"
                  >Địa chỉ <span class="text-danger">*</span></label
                >
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.diaChi }"
                  v-model="publisherForm.diaChi"
                  required
                />
                <div class="invalid-feedback" v-if="errors.diaChi">
                  {{ errors.diaChi }}
                </div>
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
                      : editingPublisher
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
    <!-- Modal Xác nhận xóa -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showDeleteModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận xóa</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeDeleteModal"
            ></button>
          </div>
          <div class="modal-body">
            <p>
              Bạn có chắc chắn muốn xóa nhà xuất bản "<strong>{{
                selectedPublisher?.tenNXB
              }}</strong
              >" không?
            </p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeDeleteModal"
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
import { validatePublisherForm } from "@/utils/validation";
import { showError } from "@/utils/notifications";

export default {
  name: "PublisherManagement",
  components: { LoadingSpinner },
  setup() {
    const store = useStore();
    const showAddModal = ref(false);
    const editingPublisher = ref(null);
    const searchTerm = ref("");
    const showDeleteModal = ref(false);
    const selectedPublisher = ref(null);
    const publisherForm = ref({
      maNXB: "",
      tenNXB: "",
      diaChi: "",
    });
    const errors = ref({});

    const publishers = computed(() => store.getters["publisher/allPublishers"]);
    const loading = computed(() => store.getters["publisher/isLoading"]);
    const error = computed(() => store.getters["publisher/error"]);

    const fetchPublishers = async () => {
      await store.dispatch("publisher/fetchPublishers");
    };
    const confirmDelete = (publisher) => {
      selectedPublisher.value = publisher;
      showDeleteModal.value = true;
    };

    const closeDeleteModal = () => {
      showDeleteModal.value = false;
      selectedPublisher.value = null;
    };

    const handleDelete = async () => {
      try {
        await store.dispatch(
          "publisher/deletePublisher",
          selectedPublisher.value._id
        );
        await fetchPublishers();
        closeDeleteModal();
        proxy.$toast.show("Xóa nhà xuất bản thành công", "success");
      } catch (error) {
        showError(error);
      }
    };
    const closeModal = () => {
      showAddModal.value = false;
      editingPublisher.value = null;
      publisherForm.value = {
        maNXB: "",
        tenNXB: "",
        diaChi: "",
      };
      errors.value = {};
    };
    const allBooks = computed(() => store.getters["book/allBooks"]);

    const getPublisherBookCount = (publisherId) => {
      return allBooks.value.filter((book) => book.maNXB?._id === publisherId)
        .length;
    };

    const filteredPublishers = computed(() => {
      if (!searchTerm.value) return publishers.value;

      const search = searchTerm.value.toLowerCase().trim();
      return publishers.value.filter(
        (pub) =>
          pub.maNXB.toLowerCase().includes(search) ||
          pub.tenNXB.toLowerCase().includes(search)
      );
    });

    const fetchData = async () => {
      try {
        await Promise.all([
          store.dispatch("publisher/fetchPublishers"),
          store.dispatch("book/fetchBooks"),
        ]);
      } catch (error) {
        showError(error);
      }
    };
    const editPublisher = (publisher) => {
      editingPublisher.value = publisher;
      publisherForm.value = { ...publisher };
      showAddModal.value = true;
    };

    const handleSubmit = async () => {
      try {
        const { isValid, errors: validationErrors } = validatePublisherForm(
          publisherForm.value
        );
        if (!isValid) {
          errors.value = validationErrors;
          return;
        }

        if (editingPublisher.value) {
          await store.dispatch("publisher/updatePublisher", {
            id: editingPublisher.value._id,
            publisherData: publisherForm.value,
          });
        } else {
          await store.dispatch(
            "publisher/createPublisher",
            publisherForm.value
          );
        }
        await fetchPublishers();
        closeModal();
      } catch (error) {
        showError(error);
      }
    };

    const clearError = () => {
      store.commit("publisher/SET_ERROR", null);
    };

    onMounted(fetchPublishers);

    return {
      showAddModal,
      editingPublisher,
      publisherForm,
      errors,
      loading: computed(() => store.getters["publisher/isLoading"]),
      error: computed(() => store.getters["publisher/error"]),
      publishers: filteredPublishers,
      searchTerm,
      closeModal,
      editPublisher,
      handleSubmit,
      clearError,
      getPublisherBookCount,
      showDeleteModal,
      selectedPublisher,
      confirmDelete,
      closeDeleteModal,
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
