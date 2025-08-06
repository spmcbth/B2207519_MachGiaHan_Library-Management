const express = require('express');
const router = express.Router();

const { auth, adminAuth } = require('../middlewares/authMiddleware.js');
const {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
} = require('../controllers/staffController.js');

// Tất cả routes trong file này yêu cầu quyền Admin
router.use(auth, adminAuth);

// Lấy danh sách nhân viên (Admin only)
router.get('/', getAllStaff);

// Thêm nhân viên mới (Admin only)
router.post('/', createStaff);

// Lấy thông tin nhân viên theo ID (Admin only)
router.get('/:id', getStaffById);

// Cập nhật thông tin nhân viên (Admin only)
router.put('/:id', updateStaff);

// Xóa nhân viên (Admin only)
router.delete('/:id', deleteStaff);

module.exports = router;
