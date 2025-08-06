const express = require('express');
const router = express.Router();

const { auth, adminAuth } = require('../middlewares/authMiddleware.js');
const {
  getAllBorrowRequests,
  getReaderBorrowHistory,
  createBorrowRequest,
  updateBorrowRequest,
  getPenaltyStatistics,
  getOverdueReturns,
  getCurrentOverdueBooks,     // Import API mới
  getLibraryStatistics        // Import API mới
} = require('../controllers/borrowController.js');

// Lấy tất cả yêu cầu mượn sách (Admin only)
router.get('/admin/requests', auth, adminAuth, getAllBorrowRequests);

// Cập nhật trạng thái yêu cầu mượn (Admin only)
router.put('/admin/requests/:id', auth, adminAuth, updateBorrowRequest);

// Lấy thống kê phạt (Admin only)
router.get('/admin/penalty-statistics', auth, adminAuth, getPenaltyStatistics);

// Lấy danh sách trả sách trễ (Admin only)
router.get('/admin/overdue-returns', auth, adminAuth, getOverdueReturns);

// **THÊM MỚI** - Lấy danh sách sách đang quá hạn (Admin only)
router.get('/admin/current-overdue', auth, adminAuth, getCurrentOverdueBooks);

// **THÊM MỚI** - Lấy thống kê tổng quan thư viện (Admin only)
router.get('/admin/library-statistics', auth, adminAuth, getLibraryStatistics);

// Lịch sử mượn sách của độc giả
router.get('/history', auth, getReaderBorrowHistory);

// Gửi yêu cầu mượn sách (Độc giả)
router.post('/request', auth, createBorrowRequest);

module.exports = router;