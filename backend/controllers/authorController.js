const TacGia = require('../models/TacGia');

// Lấy danh sách tất cả tác giả
const getAllAuthors = async (req, res) => {
  try {
    const authors = await TacGia.find(); // Truy vấn toàn bộ collection
    res.json(authors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm tác giả mới
const createAuthor = async (req, res) => {
  try {
    const author = new TacGia(req.body); // Tạo instance từ dữ liệu gửi lên
    await author.save(); // Lưu vào database
    res.status(201).json(author);
  } catch (error) {
    console.error('Create author error:', error); // Ghi log lỗi server
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật thông tin tác giả theo ID
const updateAuthor = async (req, res) => {
  try {
    const author = await TacGia.findByIdAndUpdate(
      req.params.id,       // Lấy ID từ URL
      req.body,            // Dữ liệu cần cập nhật
      { new: true }        // Trả về bản ghi sau khi cập nhật
    );

    if (!author) {
      return res.status(404).json({ message: 'Không tìm thấy tác giả' });
    }

    res.json(author);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa tác giả theo ID
const deleteAuthor = async (req, res) => {
  try {
    const author = await TacGia.findByIdAndDelete(req.params.id);

    if (!author) {
      return res.status(404).json({ message: 'Không tìm thấy tác giả' });
    }

    res.json({ message: 'Xóa tác giả thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin tác giả theo ID
const getAuthorById = async (req, res) => {
  try {
    const author = await TacGia.findById(req.params.id);

    if (!author) {
      return res.status(404).json({ message: 'Không tìm thấy tác giả' });
    }

    res.json(author);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getAuthorById
};
