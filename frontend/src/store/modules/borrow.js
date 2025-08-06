import api from '@/services/api';

export default {
  namespaced: true,

  // STATE - Trạng thái lưu trữ dữ liệu
  state: {
    borrowRequests: [],     // Danh sách các yêu cầu mượn sách (cho admin)
    borrowHistory: [],      // Lịch sử mượn sách (cho người dùng)
    penaltyStatistics: {},  // Thống kê phạt
    overdueReturns: [],     // Danh sách trả sách trễ
    currentOverdueBooks: [], // **THÊM MỚI** - Sách đang quá hạn
    libraryStatistics: {},  // **THÊM MỚI** - Thống kê tổng quan
    loading: false,         // Cờ kiểm soát trạng thái loading
    error: null             // Biến lưu trữ thông báo lỗi
  },

  // MUTATIONS - Các hàm thay đổi trực tiếp state
  mutations: {
    SET_BORROW_REQUESTS(state, requests) {
      state.borrowRequests = requests;
    },
    SET_BORROW_HISTORY(state, history) {
      state.borrowHistory = history;
    },
    SET_PENALTY_STATISTICS(state, statistics) {
      state.penaltyStatistics = statistics;
    },
    SET_OVERDUE_RETURNS(state, returns) {
      state.overdueReturns = returns;
    },
    SET_CURRENT_OVERDUE_BOOKS(state, books) { // **THÊM MỚI**
      state.currentOverdueBooks = books;
    },
    SET_LIBRARY_STATISTICS(state, statistics) { // **THÊM MỚI**
      state.libraryStatistics = statistics;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_ERROR(state) {
      state.error = null;
    }
  },

  // ACTIONS - Các hành động bất đồng bộ (gọi API)
  actions: {
    // Lấy tất cả yêu cầu mượn sách (chỉ dành cho admin)
    async fetchBorrowRequests({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/muonsach/admin/requests');
        const cleanedData = response.data.map(request => ({
          ...request,
          maDocGia: request.maDocGia || { hoLot: 'N/A', ten: '', maDocGia: 'N/A' },
          maSach: request.maSach || { tenSach: 'N/A', maSach: 'N/A' }
        }));
        commit('SET_BORROW_REQUESTS', cleanedData);
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Lấy lịch sử mượn sách của người dùng hiện tại
    async fetchBorrowHistory({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/muonsach/history');
        commit('SET_BORROW_HISTORY', response.data);
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
        const response = await api.post('/muonsach/request', { maSach: bookId });
        return response.data;
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

    // **THÊM MỚI** - Lấy thống kê phạt
    async fetchPenaltyStatistics({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/muonsach/admin/penalty-statistics');
        commit('SET_PENALTY_STATISTICS', response.data);
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // **THÊM MỚI** - Lấy danh sách trả sách trễ
    async fetchOverdueReturns({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/muonsach/admin/overdue-returns');
        commit('SET_OVERDUE_RETURNS', response.data);
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // **THÊM MỚI** - Lấy danh sách sách đang quá hạn
    async fetchCurrentOverdueBooks({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/muonsach/admin/current-overdue');
        commit('SET_CURRENT_OVERDUE_BOOKS', response.data);
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // **THÊM MỚI** - Lấy thống kê tổng quan thư viện
    async fetchLibraryStatistics({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/muonsach/admin/library-statistics');
        commit('SET_LIBRARY_STATISTICS', response.data);
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Hàm xóa lỗi
    clearError({ commit }) {
      commit('CLEAR_ERROR');
    }
  },

  // GETTERS - Các hàm lấy dữ liệu từ state
  getters: {
    allBorrowRequests: state => state.borrowRequests,
    borrowHistory: state => state.borrowHistory,
    penaltyStatistics: state => state.penaltyStatistics,
    overdueReturns: state => state.overdueReturns,
    currentOverdueBooks: state => state.currentOverdueBooks, // **THÊM MỚI**
    libraryStatistics: state => state.libraryStatistics,     // **THÊM MỚI**
    isLoading: state => state.loading,
    error: state => state.error
  }
};