<template>
  <div class="register-background">
    <div class="register-box">
      <!-- Hình ảnh -->
      <div class="register-left">
        <div class="image-wrapper">
          <img src="../../assets/Library-rafiki.png" class="register-image" />
        </div>
      </div>

      <!-- Form đăng ký -->
      <div class="register-right">
        <LoadingSpinner :show="loading" />

        <div class="register-title">
          <h1>Đăng ký tài khoản độc giả</h1>
          <p>Tạo tài khoản để dễ dàng mượn và trả sách</p>
        </div>

        <form @submit.prevent="handleSubmit" novalidate class="register-form">
          <!-- Thông báo lỗi -->
          <div v-if="error" class="alert alert-error">
            {{ error }}
            <button type="button" class="alert-close" @click="clearError">
              ×
            </button>
          </div>

          <!-- Mã độc giả -->
          <div class="form-group">
            <label>Mã độc giả <span class="required">*</span></label>
            <input
              v-model="formData.maDocGia"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.maDocGia }"
              placeholder="Nhập mã độc giả"
              required
              @input="validateField('maDocGia')"
            />
            <div class="error-message" v-if="errors.maDocGia">
              {{ errors.maDocGia }}
            </div>
          </div>

          <!-- Họ và Tên -->
          <div class="form-row">
            <div class="form-group">
              <label>Họ <span class="required">*</span></label>
              <input
                v-model="formData.hoLot"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.hoLot }"
                placeholder="Nhập họ"
                required
                @input="validateField('hoLot')"
              />
              <div class="error-message" v-if="errors.hoLot">
                {{ errors.hoLot }}
              </div>
            </div>
            <div class="form-group">
              <label>Tên <span class="required">*</span></label>
              <input
                v-model="formData.ten"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.ten }"
                placeholder="Nhập tên"
                required
                @input="validateField('ten')"
              />
              <div class="error-message" v-if="errors.ten">
                {{ errors.ten }}
              </div>
            </div>
          </div>

          <!-- Ngày sinh -->
          <div class="form-group">
            <label>Ngày sinh <span class="required">*</span></label>
            <input
              v-model="formData.ngaySinh"
              type="date"
              class="form-control"
              :class="{ 'is-invalid': errors.ngaySinh }"
              required
              @input="validateField('ngaySinh')"
            />
            <div class="error-message" v-if="errors.ngaySinh">
              {{ errors.ngaySinh }}
            </div>
          </div>

          <!-- Giới tính và SĐT -->
          <div class="form-row">
            <div class="form-group">
              <label>Giới tính <span class="required">*</span></label>
              <select
                v-model="formData.phai"
                class="form-control"
                :class="{ 'is-invalid': errors.phai }"
                required
                @change="validateField('phai')"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
              <div class="error-message" v-if="errors.phai">
                {{ errors.phai }}
              </div>
            </div>
            <div class="form-group">
              <label>Điện thoại <span class="required">*</span></label>
              <input
                v-model="formData.dienThoai"
                type="tel"
                class="form-control"
                :class="{ 'is-invalid': errors.dienThoai }"
                placeholder="Số điện thoại"
                required
                @input="validateField('dienThoai')"
              />
              <div class="error-message" v-if="errors.dienThoai">
                {{ errors.dienThoai }}
              </div>
            </div>
          </div>

          <!-- Địa chỉ -->
          <div class="form-group">
            <label>Địa chỉ <span class="required">*</span></label>
            <input
              v-model="formData.diaChi"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.diaChi }"
              placeholder="Nhập địa chỉ"
              required
              @input="validateField('diaChi')"
            />
            <div class="error-message" v-if="errors.diaChi">
              {{ errors.diaChi }}
            </div>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label>Email <span class="required">*</span></label>
            <input
              v-model="formData.email"
              type="email"
              class="form-control"
              :class="{ 'is-invalid': errors.email }"
              placeholder="Nhập email"
              required
              @input="validateField('email')"
            />
            <div class="error-message" v-if="errors.email">
              {{ errors.email }}
            </div>
          </div>

          <!-- Mật khẩu và Xác nhận -->
          <div class="form-row">
            <div class="form-group password-group">
              <label>Mật khẩu <span class="required">*</span></label>
              <div class="password-input-wrapper">
                <input
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  :class="{ 'is-invalid': errors.password }"
                  placeholder="Nhập mật khẩu"
                  required
                  @input="validateField('password')"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="togglePasswordVisibility"
                >
                  <i
                    :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                  ></i>
                </button>
              </div>
              <div class="error-message" v-if="errors.password">
                {{ errors.password }}
              </div>
            </div>
            <div class="form-group password-group">
              <label>Xác nhận mật khẩu <span class="required">*</span></label>
              <div class="password-input-wrapper">
                <input
                  v-model="formData.confirmPassword"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  :class="{ 'is-invalid': errors.confirmPassword }"
                  placeholder="Nhập lại mật khẩu"
                  required
                  @input="validateField('confirmPassword')"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="togglePasswordVisibility"
                >
                  <i
                    :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                  ></i>
                </button>
              </div>
              <div class="error-message" v-if="errors.confirmPassword">
                {{ errors.confirmPassword }}
              </div>
            </div>
          </div>

          <button type="submit" class="btn-register" :disabled="loading">
            {{ loading ? "Đang xử lý..." : "Đăng ký" }}
          </button>

          <p class="login-link">
            Đã có tài khoản?
            <router-link to="/login" class="text-decoration-none fw-bold">
              Đăng nhập
            </router-link>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { showError, showSuccess } from "@/utils/notifications";

export default {
  name: "RegisterForm",
  components: { LoadingSpinner },
  setup() {
    const store = useStore();
    const router = useRouter();
    const formData = ref({
      maDocGia: "",
      hoLot: "",
      ten: "",
      ngaySinh: "",
      phai: "Nam",
      diaChi: "",
      dienThoai: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    const errors = ref({});
    const loading = computed(() => store.state.auth.loading);
    const error = computed(() => store.state.auth.error);
    const showPassword = ref(false);

    const validateField = (field) => {
      const newErrors = { ...errors.value };

      if (field === "maDocGia") {
        if (!formData.value.maDocGia) {
          newErrors.maDocGia = "Mã độc giả là bắt buộc";
        } else {
          delete newErrors.maDocGia;
        }
      }

      if (field === "hoLot") {
        if (!formData.value.hoLot) {
          newErrors.hoLot = "Họ là bắt buộc";
        } else {
          delete newErrors.hoLot;
        }
      }

      if (field === "ten") {
        if (!formData.value.ten) {
          newErrors.ten = "Tên là bắt buộc";
        } else {
          delete newErrors.ten;
        }
      }

      if (field === "ngaySinh") {
        if (!formData.value.ngaySinh) {
          newErrors.ngaySinh = "Ngày sinh là bắt buộc";
        } else {
          delete newErrors.ngaySinh;
        }
      }

      if (field === "phai") {
        if (!formData.value.phai) {
          newErrors.phai = "Giới tính là bắt buộc";
        } else {
          delete newErrors.phai;
        }
      }

      if (field === "diaChi") {
        if (!formData.value.diaChi) {
          newErrors.diaChi = "Địa chỉ là bắt buộc";
        } else {
          delete newErrors.diaChi;
        }
      }

      if (field === "dienThoai") {
        if (!formData.value.dienThoai) {
          newErrors.dienThoai = "Số điện thoại là bắt buộc";
        } else if (!/^[0][0-9]{9}$/.test(formData.value.dienThoai)) {
          newErrors.dienThoai =
            "Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số";
        } else {
          delete newErrors.dienThoai;
        }
      }

      if (field === "email") {
        if (!formData.value.email) {
          newErrors.email = "Email là bắt buộc";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
          newErrors.email = "Email không hợp lệ";
        } else {
          delete newErrors.email;
        }
      }

      if (field === "password") {
        if (!formData.value.password) {
          newErrors.password = "Mật khẩu là bắt buộc";
        } else if (formData.value.password.length < 5) {
          newErrors.password = "Mật khẩu phải có ít nhất 5 ký tự";
        } else if (!/(?=.*[A-Za-z])(?=.*\d).+/.test(formData.value.password)) {
          newErrors.password = "Mật khẩu phải chứa cả chữ và số";
        } else {
          delete newErrors.password;
        }
        // Kiểm tra lại confirmPassword khi password thay đổi
        if (
          formData.value.confirmPassword &&
          formData.value.confirmPassword !== formData.value.password
        ) {
          newErrors.confirmPassword = "Mật khẩu và xác nhận mật khẩu phải khớp";
        } else if (formData.value.confirmPassword) {
          delete newErrors.confirmPassword;
        }
      }

      if (field === "confirmPassword") {
        if (!formData.value.confirmPassword) {
          newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
        } else if (formData.value.confirmPassword !== formData.value.password) {
          newErrors.confirmPassword = "Mật khẩu và xác nhận mật khẩu phải khớp";
        } else {
          delete newErrors.confirmPassword;
        }
      }

      errors.value = newErrors;
    };

    const validateForm = () => {
      const newErrors = {};
      if (!formData.value.maDocGia) {
        newErrors.maDocGia = "Mã độc giả là bắt buộc";
      }
      if (!formData.value.hoLot) {
        newErrors.hoLot = "Họ là bắt buộc";
      }
      if (!formData.value.ten) {
        newErrors.ten = "Tên là bắt buộc";
      }
      if (!formData.value.ngaySinh) {
        newErrors.ngaySinh = "Ngày sinh là bắt buộc";
      }
      if (!formData.value.phai) {
        newErrors.phai = "Giới tính là bắt buộc";
      }
      if (!formData.value.diaChi) {
        newErrors.diaChi = "Địa chỉ là bắt buộc";
      }
      if (!formData.value.dienThoai) {
        newErrors.dienThoai = "Số điện thoại là bắt buộc";
      } else if (!/^[0][0-9]{9}$/.test(formData.value.dienThoai)) {
        newErrors.dienThoai =
          "Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số";
      }
      if (!formData.value.email) {
        newErrors.email = "Email là bắt buộc";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
        newErrors.email = "Email không hợp lệ";
      }
      if (!formData.value.password) {
        newErrors.password = "Mật khẩu là bắt buộc";
      } else if (formData.value.password.length < 5) {
        newErrors.password = "Mật khẩu phải có ít nhất 5 ký tự";
      } else if (!/(?=.*[A-Za-z])(?=.*\d).+/.test(formData.value.password)) {
        newErrors.password = "Mật khẩu phải chứa cả chữ và số";
      }
      if (!formData.value.confirmPassword) {
        newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
      } else if (formData.value.confirmPassword !== formData.value.password) {
        newErrors.confirmPassword = "Mật khẩu và xác nhận mật khẩu phải khớp";
      }
      errors.value = newErrors;
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      try {
        await store.dispatch("auth/registerReader", formData.value);
        showSuccess("Đăng ký thành công");
        errors.value = {};
        router.push("/reader");
      } catch (err) {
        showError(err);
      }
    };

    const clearError = () => {
      store.commit("auth/SET_ERROR", null);
    };

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    return {
      formData,
      loading,
      error,
      errors,
      showPassword,
      togglePasswordVisibility,
      handleSubmit,
      clearError,
      validateField,
    };
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.register-background {
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.register-box {
  display: flex;
  width: 100%;
  max-width: 1200px;
  height: 650px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 123, 191, 0.1);
  overflow: hidden;
}

.register-left {
  flex: 1;
  background: linear-gradient(135deg, #81d4fa 0%, #4fc3f7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
}

.image-wrapper {
  max-width: 80%;
}

.register-image {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.register-right {
  flex: 1;
  padding: 25px 35px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background: white;
  overflow-y: auto;
  position: relative;
}

.register-title {
  text-align: center;
  margin-bottom: 20px;
}

.register-title h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #37474f;
  margin-bottom: 8px;
}

.register-title p {
  font-size: 0.95rem;
  color: #78909c;
  font-weight: 400;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #546e7a;
  margin-bottom: 4px;
}

.required {
  color: #f44336;
}

.form-control {
  padding: 10px 12px;
  border: 1px solid #cfd8dc;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
  background: #fafafa;
  color: #37474f;
}

.form-control:focus {
  outline: none;
  border-color: #4fc3f7;
  background: white;
  box-shadow: 0 0 0 2px rgba(79, 195, 247, 0.1);
}

.form-control.is-invalid {
  border-color: #f44336;
  background: #ffebee;
}

.form-control::placeholder {
  color: #a0aec0;
}

select.form-control {
  cursor: pointer;
}

.password-group {
  position: relative;
}

.password-input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: #78909c;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #4fc3f7;
}

.error-message {
  color: #f44336;
  font-size: 0.8rem;
  margin-top: 5px;
  font-weight: 500;
}

.alert {
  padding: 15px 20px;
  border-radius: 10px;
  font-weight: 500;
  margin: 10px 0;
  border: none;
  position: relative;
}

.alert-error {
  background: #ffebee;
  color: #c62828;
  border-left: 4px solid #ef5350;
}

.alert-close {
  position: absolute;
  right: 15px;
  top: 15px;
  border: none;
  background: transparent;
  color: #c62828;
  font-size: 1.2rem;
  cursor: pointer;
  font-weight: bold;
}

.btn-register {
  background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
  box-shadow: 0 2px 8px rgba(79, 195, 247, 0.3);
  width: 100%;
}

.btn-register:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.4);
}

.btn-register:active {
  transform: translateY(0);
}

.btn-register:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #78909c;
  font-size: 0.95rem;
}

.login-link a {
  color: #4fc3f7;
  font-weight: 600;
  text-decoration: none;
}

.login-link a:hover {
  color: #29b6f6;
}
</style>
