import api from '@/services/api';

export default {
  namespaced: true, // Cho phép module này hoạt động độc lập với các module khác

  // STATE - Trạng thái lưu trữ dữ liệu
  state: {
    user: JSON.parse(localStorage.getItem('user')) || null,        // Thông tin người dùng
    token: localStorage.getItem('token') || null,                   // JWT token
    userType: localStorage.getItem('userType') || null,            // Loại người dùng: 'admin' hoặc 'reader'
    loading: false,                                                // Trạng thái đang xử lý (hiện loading)
    error: null                                                    // Thông báo lỗi
  },

  // MUTATIONS - Các hàm thay đổi state
  mutations: {
    SET_USER(state, user) {
      state.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },
    SET_TOKEN(state, token) {
      state.token = token;
      localStorage.setItem('token', token);
    },
    SET_USER_TYPE(state, type) {
      state.userType = type;
      localStorage.setItem('userType', type);
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_AUTH(state) {
      state.user = null;
      state.token = null;
      state.userType = null;
      state.error = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
    }
  },

  // ACTIONS - Các hành động bất đồng bộ gọi API
  actions: {
    // Đăng nhập dành cho nhân viên (admin)
    async loginStaff({ commit }, credentials) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        const response = await api.post('/auth/staff/login', credentials);
        commit('SET_USER', response.data.nhanvien);
        commit('SET_TOKEN', response.data.token);
        commit('SET_USER_TYPE', 'admin');
        return response;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.error || 'Đăng nhập thất bại');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Đăng nhập dành cho độc giả
    async loginReader({ commit }, credentials) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        const response = await api.post('/auth/reader/login', credentials);
        commit('SET_USER', response.data.docgia);
        commit('SET_TOKEN', response.data.token);
        commit('SET_USER_TYPE', 'reader');
        return response;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.error || 'Đăng nhập thất bại');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Đăng ký tài khoản dành cho độc giả
    async registerReader({ commit }, userData) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        const response = await api.post('/auth/reader/register', userData);
        commit('SET_USER', response.data.docgia);
        commit('SET_TOKEN', response.data.token);
        commit('SET_USER_TYPE', 'reader');
        return response;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.error || 'Đăng ký thất bại');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Cập nhật thông tin hồ sơ người dùng (độc giả)
    async updateProfile({ commit, state }, userData) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        const response = await api.put('/docgia/profile', userData);
        const updatedUser = { ...state.user, ...response.data }; // Cập nhật thông tin mới vào state
        commit('SET_USER', updatedUser);
        return response;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.error || 'Cập nhật thông tin thất bại');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Đăng xuất người dùng
    logout({ commit }) {
      commit('CLEAR_AUTH');
    },

    // Xóa lỗi đang hiển thị
    clearError({ commit }) {
      commit('SET_ERROR', null);
    }
  },

  // GETTERS - Các hàm lấy dữ liệu từ state
  getters: {
    isAuthenticated: state => !!state.token,                  // Đã đăng nhập chưa
    isAdmin: state => state.userType === 'admin',             // Có phải admin không
    isReader: state => state.userType === 'reader',           // Có phải reader không
    currentUser: state => state.user,                         // Lấy thông tin người dùng hiện tại
    loading: state => state.loading,                          // Trạng thái loading
    error: state => state.error                               // Thông báo lỗi
  }
};
