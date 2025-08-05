const express = require('express');
const router = express.Router();

// Middleware xác thực và phân quyền
const { auth, adminAuth } = require('../middlewares/authMiddleware.js');

// Controller xử lý logic cho tác giả
const {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor
} = require('../controllers/authorController.js');

// Lấy danh sách tất cả tác giả
router.get('/', getAllAuthors);

// Lấy thông tin một tác giả theo ID
router.get('/:id', getAuthorById);

// Thêm mới tác giả (Admin only)
router.post('/', auth, adminAuth, createAuthor);

// Cập nhật thông tin tác giả (Admin only)
router.put('/:id', auth, adminAuth, updateAuthor);

// Xóa tác giả (Admin only)
router.delete('/:id', auth, adminAuth, deleteAuthor);

module.exports = router;
