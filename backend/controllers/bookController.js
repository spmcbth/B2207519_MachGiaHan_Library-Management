const Sach = require('../models/Sach');
const fs = require('fs');
const path = require('path');


// Lấy danh sách tất cả sách
const getAllBooks = async (req, res) => {
  try {
    // Tìm tất cả sách trong database
    //  Dùng populate để lấy thông tin chi tiết của nhà xuất bản và tác giả
    const books = await Sach.find()
      .populate('maNXB')
      .populate('maTacGia');
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm sách mới
const createBook = [
  async (req, res) => {
    try {
      // Tạo instance sách mới từ dữ liệu trong req.body
      const bookData = {
        maSach: req.body.maSach,
        tenSach: req.body.tenSach,
        maNXB: req.body.maNXB,
        maTacGia: req.body.maTacGia,
        donGia: req.body.donGia,
        soQuyen: req.body.soQuyen,
        namXuatBan: req.body.namXuatBan,
        nguonGoc: req.body.nguonGoc,
        imagePath: req.file ? `uploads/${req.file.filename}` : null
      };
      const book = new Sach(bookData);
      // Lưu sách vào database
      await book.save();
      res.status(201).json(book);
    } catch (error) {
      res.status(400).json({ message: error.message });
      // Ghi log lỗi để hỗ trợ debug
      console.error('Create book error:', error);
    }
  }
];

// Cập nhật thông tin sách
const updateBook = [
  async (req, res) => {
    try {
      // Kiểm tra nếu có file mới được upload
      if (req.file) {
        req.body.imagePath = `uploads/${req.file.filename}`; // Cập nhật đường dẫn hình ảnh mới
      }
      // Tìm sách theo ID và cập nhật thông tin
      const book = await Sach.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!book) {
        return res.status(404).json({ message: 'Không tìm thấy sách' });
      }
      res.json(book);
    } catch (error) {
      res.status(400).json({ message: error.message });
      console.error('Update book error:', error);
    }
  }
];

// Xóa sách theo ID
const deleteBook = async (req, res) => {
  try {
    const book = await Sach.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }
    // Xóa ảnh trong thư mục uploads nếu tồn tại
    if (book.imagePath) {
      const imagePath = path.join(__dirname, '..', 'uploads', book.imagePath);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Không thể xóa ảnh:', err.message);
        } else {
          console.log('Đã xóa ảnh:', imagePath);
        }
      });
    }
    res.json({ message: 'Xóa sách thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error('Delete book error:', error);
  }
};

// Lấy thông tin một sách theo ID
const getBookById = async (req, res) => {
  try {
    const book = await Sach.findById(req.params.id)
      .populate('maNXB')
      .populate('maTacGia');
    if (!book) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error('Get book by ID error:', error);
  }
};

module.exports = {
  getAllBooks,
  createBook,
  updateBook,
  deleteBook,
  getBookById
};