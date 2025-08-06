const DocGia = require('../models/DocGia');

// Lấy danh sách tất cả độc giả (chỉ dành cho admin)
const getAllReaders = async (req, res) => {
  try {
    // Tìm tất cả độc giả, loại bỏ trường password khỏi kết quả
    const readers = await DocGia.find().select('-password');
    res.json(readers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin một độc giả theo ID (chỉ dành cho admin)
const getReaderById = async (req, res) => {
  try {
    // Tìm độc giả theo ID từ tham số URL, loại bỏ trường password
    const reader = await DocGia.findById(req.params.id).select('-password');
    if (!reader) {
      return res.status(404).json({ message: 'Không tìm thấy độc giả' });
    }
    res.json(reader);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa độc giả theo ID (chỉ dành cho admin)
const deleteReader = async (req, res) => {
  try {
    const reader = await DocGia.findByIdAndDelete(req.params.id);
    if (!reader) {
      return res.status(404).json({ message: 'Không tìm thấy độc giả' });
    }
    res.json({ message: 'Xóa độc giả thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin cá nhân của độc giả (cho độc giả đã xác thực)
const updateProfile = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    // Danh sách các trường được phép cập nhật
    const allowedUpdates = ['hoLot', 'ten', 'ngaySinh', 'phai', 'diaChi', 'dienThoai', 'email'];
    // Kiểm tra xem các trường cập nhật có hợp lệ không
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    // Nếu có trường không hợp lệ, trả về lỗi 400
    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates!' });
    }

    // Tìm độc giả theo ID từ thông tin người dùng đã xác thực (req.user._id)
    const reader = await DocGia.findById(req.user._id);
    if (!reader) {
      return res.status(404).json({ message: 'Không tìm thấy độc giả' });
    }

    // Cập nhật từng trường được gửi trong req.body
    updates.forEach(update => reader[update] = req.body[update]);
    await reader.save();

    // Tạo bản sao của độc giả và loại bỏ trường password trước khi trả về
    const readerResponse = reader.toObject();
    delete readerResponse.password;

    res.json(readerResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy thông tin cá nhân của độc giả (cho độc giả đã xác thực)
const getProfile = async (req, res) => {
  try {
    // Tìm độc giả theo ID từ thông tin người dùng đã xác thực, loại bỏ trường password
    const reader = await DocGia.findById(req.user._id).select('-password');
    if (!reader) {
      return res.status(404).json({ message: 'Không tìm thấy độc giả' });
    }
    res.json(reader);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllReaders,
  getReaderById,
  deleteReader,
  updateProfile,
  getProfile
};