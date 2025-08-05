<template>
  <div class="reader-management">
    <LoadingSpinner :show="loading" />

    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Quản lý độc giả</h2>
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
            placeholder="Tìm kiếm độc giả theo mã độc giả, họ và tên, email, số điện thoại"
          />
          <button
            class="btn btn-outline-secondary"
            type="button"
            @click="handleSearch"
          >
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Danh sách độc giả -->
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Mã độc giả</th>
            <th>Họ và tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Ngày sinh</th>
            <th>Địa chỉ</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="reader in readers" :key="reader._id">
            <td>{{ reader.maDocGia }}</td>
            <td>{{ reader.hoLot }} {{ reader.ten }}</td>
            <td>{{ reader.email }}</td>
            <td>{{ reader.dienThoai }}</td>
            <td>{{ formatDate(reader.ngaySinh) }}</td>
            <td>{{ reader.diaChi }}</td>
            <td>
              <button
                class="btn btn-sm btn-danger"
                @click="confirmDelete(reader)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Confirmation Modal -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showConfirmModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận xóa</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeConfirmModal"
            ></button>
          </div>
          <div class="modal-body">
            <p>
              Bạn có chắc muốn xóa độc giả "{{ selectedReader?.hoLot }}
              {{ selectedReader?.ten }}" không?
            </p>
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
              class="btn btn-danger"
              @click="handleConfirmDelete"
              :disabled="loading"
            >
              {{ loading ? "Đang xử lý..." : "Xóa" }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showConfirmModal"></div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { showError } from "@/utils/notifications";
import api from "@/services/api";

export default {
  name: "ReaderManagement",
  components: { LoadingSpinner },
  setup() {
    const readers = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const searchTerm = ref("");
    const selectedReader = ref(null);
    const showConfirmModal = ref(false);
    const selectedReaderId = ref(null);

    const filteredReaders = computed(() => {
      if (!searchTerm.value) return readers.value;
      const search = searchTerm.value.toLowerCase();
      return readers.value.filter(
        (reader) =>
          reader.maDocGia.toLowerCase().includes(search) ||
          `${reader.hoLot} ${reader.ten}`.toLowerCase().includes(search) ||
          reader.email.toLowerCase().includes(search) ||
          reader.dienThoai.toLowerCase().includes(search)
      );
    });

    const fetchReaders = async () => {
      loading.value = true;
      try {
        const response = await api.get("/docgia");
        readers.value = response.data;
      } catch (error) {
        showError(error);
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("vi-VN");
    };

    const confirmDelete = (reader) => {
      selectedReader.value = reader;
      showConfirmModal.value = true;
    };

    const closeConfirmModal = () => {
      showConfirmModal.value = false;
      selectedReader.value = null;
    };

    const handleConfirmDelete = async () => {
      try {
        loading.value = true;
        await api.delete(`/docgia/${selectedReader.value._id}`);
        await fetchReaders();
        proxy.$toast.show("Xóa độc giả thành công", "success");
        closeConfirmModal();
      } catch (error) {
        showError(error);
      } finally {
        loading.value = false;
      }
    };

    const clearError = () => {
      error.value = null;
    };

    const handleSearch = () => {
      // Filtering is handled by computed property
    };

    onMounted(fetchReaders);

    return {
      readers: filteredReaders,
      loading,
      error,
      searchTerm,
      showConfirmModal,
      handleSearch,
      selectedReader,
      confirmDelete,
      closeConfirmModal,
      handleConfirmDelete,
      clearError,
      formatDate,
    };
  },
};
</script>

<style scoped>
/* Input group tìm kiếm */
.input-group {
  max-width: 500px;
}

.input-group .form-control {
  border-radius: 6px 0 0 6px;
  font-size: 0.95rem;
}

.input-group .btn {
  border-radius: 0 6px 6px 0;
  color: #4fc3f7;
  border-color: #4fc3f7;
}

.input-group .btn:hover {
  background-color: #4fc3f7;
  color: white;
}

/* Table */
.table {
  font-size: 0.95rem;
  border-collapse: collapse;
  margin-top: 1rem;
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

/* Nút thao tác */
.btn-sm {
  border-radius: 4px;
}

.btn-danger {
  background-color: #ef5350;
  border-color: #ef5350;
  color: white;
}

.btn-danger:hover {
  background-color: #e53935;
  border-color: #e53935;
}

/* Modal */
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.modal-title {
  font-weight: 600;
}

/* Alert lỗi */
.alert {
  font-size: 0.95rem;
  border-left: 4px solid #f44336;
}

/* Nút "X" của alert */
.btn-close {
  padding: 0.5rem;
}
</style>
