import api from '@/services/api';

export default {
  // Cho phép module này hoạt động độc lập bằng cách thêm tiền tố 'tên module/' khi gọi action, mutation hoặc getter
  namespaced: true,

  // STATE - Trạng thái lưu trữ dữ liệu
  state: {
    authors: [],        // Danh sách các tác giả
    loading: false,     // Trạng thái loading khi đang tải dữ liệu
    error: null         // Lưu thông báo lỗi (nếu có)
  },

  // MUTATIONS - Các hàm thay đổi trực tiếp state
  mutations: {
    // Cập nhật danh sách tác giả
    SET_AUTHORS(state, authors) {
      state.authors = authors;
    },

    // Cập nhật trạng thái loading
    SET_LOADING(state, status) {
      state.loading = status;
    },

    // Cập nhật lỗi
    SET_ERROR(state, error) {
      state.error = error;
    }
  },

  // ACTIONS - Các hành động bất đồng bộ (gọi API)
  actions: {
    // Lấy danh sách tác giả từ API
    async fetchAuthors({ commit }) {
      try {
        commit('SET_LOADING', true); // Bắt đầu loading
        const response = await api.get('/tacgia'); // Gọi API GET /tacgia
        console.log('API response:', response.data); // Debug xem dữ liệu trả về
        commit('SET_AUTHORS', response.data); // Lưu vào state
      } catch (error) {
        commit('SET_ERROR', error.message); // Ghi lại lỗi nếu có
      } finally {
        commit('SET_LOADING', false); // Dừng loading dù thành công hay thất bại
      }
    },

    // Gửi yêu cầu tạo mới một tác giả
    async createAuthor({ commit }, authorData) {
      try {
        const response = await api.post('/tacgia', authorData); // POST dữ liệu tác giả
        return response.data; // Trả về dữ liệu phản hồi (có thể chứa tác giả mới)
      } catch (error) {
        commit('SET_ERROR', error.message); // Ghi lỗi
        throw error; // Ném lỗi để component phía trên xử lý tiếp
      }
    },

    // Cập nhật thông tin tác giả theo ID
    async updateAuthor({ commit }, { id, authorData }) {
      try {
        const response = await api.put(`/tacgia/${id}`, authorData); // PUT cập nhật tác giả
        return response.data; // Trả về dữ liệu phản hồi
      } catch (error) {
        commit('SET_ERROR', error.message); // Ghi lỗi
        throw error;
      }
    },

    // Xóa tác giả theo ID
    async deleteAuthor({ commit }, id) {
      try {
        await api.delete(`/tacgia/${id}`); // Gửi yêu cầu xóa tác giả
      } catch (error) {
        commit('SET_ERROR', error.message); // Ghi lỗi
        throw error;
      }
    }
  },

  // GETTERS - Các hàm lấy dữ liệu từ state
  getters: {
    allAuthors: state => state.authors,     // Trả về toàn bộ danh sách tác giả
    isLoading: state => state.loading,      // Trả về trạng thái loading
    error: state => state.error             // Trả về lỗi nếu có
  }
};
