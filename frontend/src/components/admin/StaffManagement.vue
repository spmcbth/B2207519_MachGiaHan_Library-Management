<template>
  <div class="staff-management">
    <LoadingSpinner :show="loading" />

    <!-- Header section -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Quản lý nhân viên</h2>
      <button class="btn btn-primary" @click="showAddModal = true">
        <i class="fas fa-plus"></i> Thêm nhân viên mới
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
            placeholder="Tìm kiếm theo MSNV, họ tên, chức vụ, địa chỉ, số điện thoại"
          />
          <span class="input-group-text">
            <i class="fas fa-search"></i>
          </span>
        </div>
      </div>
    </div>

    <!-- Danh sách nhân viên -->
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>MSNV</th>
            <th>Họ tên</th>
            <th>Chức vụ</th>
            <th>Địa chỉ</th>
            <th>Số điện thoại</th>
            <th>Vai trò</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="staff in staffList" :key="staff._id">
            <td>{{ staff.MSNV }}</td>
            <td>{{ staff.hoTenNV }}</td>
            <td>{{ staff.chucVu }}</td>
            <td>{{ staff.diaChi }}</td>
            <td>{{ staff.soDienThoai }}</td>
            <td>{{ staff.role === "admin" ? "Quản trị" : "Nhân viên" }}</td>
            <td>
              <button
                class="btn btn-sm btn-info me-2"
                @click="editStaff(staff)"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="btn btn-sm btn-danger"
                @click="confirmDelete(staff)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal thêm/sửa nhân viên -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showAddModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{
                editingStaff ? "Sửa thông tin nhân viên" : "Thêm nhân viên mới"
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
                <label class="form-label">MSNV</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="staffForm.MSNV"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Họ tên</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="staffForm.hoTenNV"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Chức vụ</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="staffForm.chucVu"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Địa chỉ</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="staffForm.diaChi"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Số điện thoại</label>
                <input
                  type="tel"
                  class="form-control"
                  v-model="staffForm.soDienThoai"
                  required
                />
              </div>
              <div class="mb-3 position-relative">
                <label class="form-label">Mật khẩu</label>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  :class="{ 'is-invalid': errors.password }"
                  v-model="staffForm.password"
                  :required="!editingStaff"
                />
                <button
                  type="button"
                  class="btn btn-outline-secondary position-absolute top-50 end-0 translate-middle-y me-2"
                  @click="togglePasswordVisibility"
                  style="z-index: 1"
                >
                  <i
                    :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
                  ></i>
                </button>
                <div class="invalid-feedback" v-if="errors.password">
                  {{ errors.password }}
                </div>
                <small class="text-muted" v-if="editingStaff">
                  Để trống nếu không muốn thay đổi mật khẩu
                </small>
              </div>
              <button type="submit" class="btn btn-primary">
                {{ editingStaff ? "Cập nhật" : "Thêm mới" }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
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
              Bạn có chắc chắn muốn xóa nhân viên "{{ selectedStaff?.hoTenNV }}"
              không?
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
    <div class="modal-backdrop fade show" v-if="showDeleteModal"></div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { validateStaffForm } from "@/utils/validation";
import { showError } from "@/utils/notifications";
import api from "@/services/api";

export default {
  name: "StaffManagement",
  components: { LoadingSpinner },
  setup() {
    const staffList = ref([]);
    const showAddModal = ref(false);
    const editingStaff = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const showDeleteModal = ref(false);
    const selectedStaff = ref(null);
    const searchTerm = ref("");
    const staffForm = ref({
      MSNV: "",
      hoTenNV: "",
      chucVu: "",
      diaChi: "",
      soDienThoai: "",
      password: "",
    });
    const errors = ref({});
    const showPassword = ref(false); // Thêm trạng thái hiển thị mật khẩu

    const fetchStaff = async () => {
      loading.value = true;
      try {
        const response = await api.get("/nhanvien");
        staffList.value = response.data;
      } catch (err) {
        showError(err);
      } finally {
        loading.value = false;
      }
    };
    const confirmDelete = (staff) => {
      selectedStaff.value = staff;
      showDeleteModal.value = true;
    };

    const closeDeleteModal = () => {
      showDeleteModal.value = false;
      selectedStaff.value = null;
    };

    const handleDelete = async () => {
      try {
        await api.delete(`/nhanvien/${selectedStaff.value._id}`);
        await fetchStaff();
        closeDeleteModal();
        proxy.$toast.show("Xóa nhân viên thành công", "success");
      } catch (error) {
        showError(error);
      }
    };
    const filteredStaff = computed(() => {
      if (!searchTerm.value.trim()) return staffList.value;

      const search = searchTerm.value.toLowerCase().trim();
      return staffList.value.filter(
        (staff) =>
          staff.MSNV.toLowerCase().includes(search) ||
          staff.hoTenNV.toLowerCase().includes(search) ||
          staff.chucVu.toLowerCase().includes(search) ||
          staff.diaChi.toLowerCase().includes(search) ||
          staff.soDienThoai.includes(search)
      );
    });

    const closeModal = () => {
      showAddModal.value = false;
      editingStaff.value = null;
      staffForm.value = {
        MSNV: "",
        hoTenNV: "",
        chucVu: "",
        diaChi: "",
        soDienThoai: "",
        role: "staff",
        password: "",
      };
    };

    const editStaff = (staff) => {
      editingStaff.value = staff;
      staffForm.value = { ...staff, password: "" };
      showAddModal.value = true;
    };

    const handleSubmit = async () => {
      try {
        const { isValid, errors: validationErrors } = validateStaffForm(
          staffForm.value
        );
        if (!isValid) {
          errors.value = validationErrors;
          return;
        }

        if (editingStaff.value) {
          await api.put(`/nhanvien/${editingStaff.value._id}`, staffForm.value);
        } else {
          await api.post("/nhanvien", staffForm.value);
        }
        await fetchStaff();
        closeModal();
      } catch (error) {
        showError(error);
      }
    };

    const clearError = () => {
      error.value = null;
    };

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    onMounted(fetchStaff);

    return {
      staffList,
      showAddModal,
      editingStaff,
      staffForm,
      loading,
      error,
      errors,
      searchTerm,
      filteredStaff,
      closeModal,
      editStaff,
      handleSubmit,
      showDeleteModal,
      selectedStaff,
      confirmDelete,
      closeDeleteModal,
      handleDelete,
      clearError,
      showPassword,
      togglePasswordVisibility,
    };
  },
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

/* Search Box */
.input-group {
  max-width: 500px;
}

.input-group .form-control {
  border-radius: 6px 0 0 6px;
  font-size: 0.95rem;
  border-right: none;
}

.input-group-text {
  background-color: white;
  border-left: none;
  color: #1976d2;
  border: 1px solid #bbdefb;
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
  background-color: white;
  border: 1px solid #bbdefb;
  border-radius: 6px;
  overflow: hidden;
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

.btn-primary {
  background-color: #1976d2;
  border-color: #1976d2;
}

.btn-primary:hover {
  background-color: #1565c0;
  border-color: #1565c0;
}

.btn-info {
  background-color: #4fc3f7;
  border-color: #4fc3f7;
  color: white;
}

.btn-info:hover {
  background-color: #29b6f6;
  border-color: #29b6f6;
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
.modal-content {
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.modal-title {
  font-weight: 600;
  color: #0d47a1;
}

/* Label */
.form-label {
  color: #0d47a1;
  font-weight: 500;
}

/* Eye toggle */
.position-absolute.btn {
  background-color: transparent;
  border: none;
  color: #1976d2;
}

.position-absolute.btn:hover {
  color: #0d47a1;
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
