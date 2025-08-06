const express = require('express');
const router = express.Router();

const {
  loginStaff,
  loginReader,
  registerReader
} = require('../controllers/authController.js');

// Nhân viên đăng nhập
router.post('/staff/login', loginStaff);

// Độc giả đăng nhập
router.post('/reader/login', loginReader);

// Độc giả đăng ký
router.post('/reader/register', registerReader);

module.exports = router;
