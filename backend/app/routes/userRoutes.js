const express = require('express');
const router = express.Router();

const { auth, adminAuth } = require('../middlewares/authMiddleware.js');
const {
  getAllReaders,
  getReaderById,
  deleteReader,
  updateProfile,
  getProfile
} = require('../controllers/userController');

// Lấy danh sách tất cả độc giả (Admin only)
router.get('/', auth, adminAuth, getAllReaders);

// Lấy thông tin độc giả theo ID (Admin only)
router.get('/:id', auth, adminAuth, getReaderById);

// Xoá tài khoản độc giả (Admin only)
router.delete('/:id', auth, adminAuth, deleteReader);

// Cập nhật thông tin cá nhân (Độc giả)
router.put('/profile', auth, updateProfile);

// Lấy thông tin cá nhân (Độc giả)
router.get('/profile', auth, getProfile);

module.exports = router;
