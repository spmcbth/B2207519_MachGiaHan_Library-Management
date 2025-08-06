const NhanVien = require('../models/NhanVien');
const bcrypt = require('bcryptjs');

// Lấy danh sách tất cả nhân viên
const getAllStaff = async (req, res) => {
  try {
    // Tìm tất cả nhân viên, loại bỏ trường password khỏi kết quả
    const staff = await NhanVien.find().select('-password');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm nhân viên mới
const createStaff = async (req, res) => {
  try {
    const { MSNV, password, ...staffData } = req.body;
    
    const existingStaff = await NhanVien.findOne({ MSNV });
    if (existingStaff) {
      return res.status(400).json({ message: 'MSNV đã tồn tại' });
    }

    // Mã hóa mật khẩu với độ dài salt là 8
    const hashedPassword = await bcrypt.hash(password, 8);
    
    // Tạo instance nhân viên mới với MSNV, mật khẩu mã hóa và dữ liệu còn lại
    const staff = new NhanVien({
      MSNV,
      password: hashedPassword,
      ...staffData
    });
    
    // Lưu nhân viên vào database
    await staff.save();
    // Tạo bản sao của nhân viên và loại bỏ trường password trước khi trả về
    const staffResponse = staff.toObject();
    delete staffResponse.password;
    
    res.status(201).json(staffResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật thông tin nhân viên
const updateStaff = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
    // Nếu có password mới, mã hóa trước khi cập nhật
    if (password) {
      updateData.password = await bcrypt.hash(password, 8);
    }

    // Tìm và cập nhật nhân viên theo ID, trả về bản ghi đã cập nhật
    // Loại bỏ trường password khỏi kết quả trả về
    const staff = await NhanVien.findByIdAndUpdate(
      req.params.id, 
      updateData,
      { new: true } 
    ).select('-password');
    
    // Kiểm tra nếu không tìm thấy nhân viên
    if (!staff) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    res.json(staff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa nhân viên theo ID
const deleteStaff = async (req, res) => {
  try {
    const staff = await NhanVien.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    res.json({ message: 'Xóa nhân viên thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin một nhân viên theo ID
const getStaffById = async (req, res) => {
  try {
    const staff = await NhanVien.findById(req.params.id).select('-password');
    if (!staff) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffById
};