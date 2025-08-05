const express = require('express');
const router = express.Router();

const { auth, adminAuth } = require('../middlewares/authMiddleware.js');
const {
  getAllBorrowRequests,
  getReaderBorrowHistory,
  createBorrowRequest,
  updateBorrowRequest
} = require('../controllers/borrowController.js');

// Lấy tất cả yêu cầu mượn sách (Admin only)
router.get('/admin/requests', auth, adminAuth, getAllBorrowRequests);

// Cập nhật trạng thái yêu cầu mượn (Admin only)
router.put('/admin/requests/:id', auth, adminAuth, updateBorrowRequest);

// Lịch sử mượn sách của độc giả
router.get('/history', auth, getReaderBorrowHistory);

// Gửi yêu cầu mượn sách (Độc giả)
router.post('/request', auth, createBorrowRequest);

module.exports = router;