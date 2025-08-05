import api from '@/services/api';

export default {
  namespaced: true,

  // STATE - Trạng thái lưu trữ dữ liệu
  state: {
    borrowRequests: [],     // Danh sách các yêu cầu mượn sách (cho admin)
    borrowHistory: [],      // Lịch sử mượn sách (cho người dùng)
    loading: false,         // Cờ kiểm soát trạng thái loading
    error: null             // Biến lưu trữ thông báo lỗi
  },

  // MUTATIONS - Các hàm thay đổi trực tiếp state
  mutations: {
    SET_BORROW_REQUESTS(state, requests) {
      state.borrowRequests = requests;  // Gán danh sách yêu cầu mượn vào state
    },
    SET_BORROW_HISTORY(state, history) {
      state.borrowHistory = history;    // Gán lịch sử mượn vào state
    },
    SET_LOADING(state, status) {
      state.loading = status;           // Cập nhật trạng thái loading
    },
    SET_ERROR(state, error) {
      state.error = error;              // Cập nhật thông báo lỗi
    },
    CLEAR_ERROR(state) {
      state.error = null;               // Xóa lỗi hiện tại
    }
  },

  // ACTIONS - Các hành động bất đồng bộ (gọi API)
  actions: {
    // Lấy tất cả yêu cầu mượn sách (chỉ dành cho admin)
    async fetchBorrowRequests({ commit }) {
      commit('SET_LOADING', true); // Bắt đầu loading
      try {
        const response = await api.get('/muonsach/admin/requests');

        // Làm sạch dữ liệu để tránh lỗi khi truy cập các trường có thể null
        const cleanedData = response.data.map(request => ({
          ...request,
          maDocGia: request.maDocGia || { hoLot: 'N/A', ten: '', maDocGia: 'N/A' },
          maSach: request.maSach || { tenSach: 'N/A', maSach: 'N/A' }
        }));

        commit('SET_BORROW_REQUESTS', cleanedData); // Gán dữ liệu sau xử lý vào state
      } catch (error) {
        // Nếu lỗi, cập nhật lỗi trong state
        commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra');
        throw error; // Ném lỗi để component có thể xử lý tiếp
      } finally {
        commit('SET_LOADING', false); // Kết thúc loading
      }
    },

    // Lấy lịch sử mượn sách của người dùng hiện tại
    async fetchBorrowHistory({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/muonsach/history');
        commit('SET_BORROW_HISTORY', response.data); // Cập nhật vào state
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Gửi yêu cầu mượn sách mới
    async createBorrowRequest({ commit }, bookId) {
      commit('SET_LOADING', true);
      try {
        // Gửi dữ liệu mã sách lên server
        const response = await api.post('/muonsach/request', { maSach: bookId });
        return response.data; // Trả về dữ liệu nếu cần xử lý tiếp trong component
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Cập nhật trạng thái cho yêu cầu mượn sách (duyệt hoặc từ chối) - dùng cho admin
    async updateBorrowStatus({ commit }, { id, status }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.put(`/muonsach/admin/requests/${id}`, { trangThai: status });
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Hàm xóa lỗi để reset khi cần (thường dùng sau khi hiển thị thông báo)
    clearError({ commit }) {
      commit('CLEAR_ERROR');
    }
  },

  // GETTERS - Các hàm lấy dữ liệu từ state
  getters: {
    allBorrowRequests: state => state.borrowRequests, // Lấy tất cả yêu cầu mượn
    borrowHistory: state => state.borrowHistory,       // Lấy lịch sử mượn sách
    isLoading: state => state.loading,                 // Trạng thái loading hiện tại
    error: state => state.error                        // Lỗi hiện tại
  }
};
