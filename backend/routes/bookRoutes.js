const express = require('express');
const router = express.Router();

const { auth, adminAuth } = require('../middlewares/authMiddleware.js');
const upload = require('../config/multer.js'); // Cấu hình multer để upload ảnh

const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController.js');

// Lấy danh sách tất cả sách
router.get('/', getAllBooks);

// Lấy thông tin chi tiết sách theo ID
router.get('/:id', getBookById);

// Thêm sách mới (Admin only, có upload ảnh)
router.post('/', auth, adminAuth, upload.single('image'), createBook);

// Cập nhật thông tin sách (Admin only, có upload ảnh)
router.put('/:id', auth, upload.single('image'), adminAuth, updateBook);

// Xóa sách (Admin only)
router.delete('/:id', auth, adminAuth, deleteBook);

module.exports = router;
