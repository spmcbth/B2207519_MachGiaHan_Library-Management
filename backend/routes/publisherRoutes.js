const express = require('express');
const router = express.Router();

const { auth, adminAuth } = require('../middlewares/authMiddleware.js');
const {
  getAllPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher
} = require('../controllers/publisherController.js');

// Lấy danh sách tất cả nhà xuất bản
router.get('/', getAllPublishers);

// Lấy thông tin nhà xuất bản theo ID
router.get('/:id', getPublisherById);

// Thêm nhà xuất bản mới (Admin only)
router.post('/', auth, adminAuth, createPublisher);

// Cập nhật thông tin nhà xuất bản (Admin only)
router.put('/:id', auth, adminAuth, updatePublisher);

// Xóa nhà xuất bản (Admin only)
router.delete('/:id', auth, adminAuth, deletePublisher);

module.exports = router;
