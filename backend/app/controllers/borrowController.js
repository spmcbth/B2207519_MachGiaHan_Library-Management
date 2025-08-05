const TheoDoiMuonSach = require('../models/TheoDoiMuonSach');
const Sach = require('../models/Sach');

// Lấy danh sách tất cả yêu cầu mượn sách
const getAllBorrowRequests = async (req, res) => {
  try {
    // Tìm tất cả yêu cầu mượn sách
    // Sắp xếp theo thời gian tạo (mới nhất trước)
    const requests = await TheoDoiMuonSach.find()
      .populate('maDocGia')
      .populate('maSach')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy lịch sử mượn sách của một độc giả
const getReaderBorrowHistory = async (req, res) => {
  try {
    const history = await TheoDoiMuonSach.find({ maDocGia: req.user._id })
      .populate({
        path: 'maSach',
        select: 'maSach tenSach soQuyen'
      })
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo yêu cầu mượn sách mới
const createBorrowRequest = async (req, res) => {
  try {
    // Tạo instance yêu cầu mượn sách mới
    const borrowRequest = new TheoDoiMuonSach({
      maDocGia: req.user._id, // ID độc giả từ thông tin người dùng đã xác thực
      maSach: req.body.maSach, // Mã sách từ body
      ngayMuon: new Date(), // Ngày mượn là thời điểm hiện tại
      trangThai: 'Chờ duyệt' // Trạng thái mặc định là Chờ duyệt
    });
    await borrowRequest.save();
    res.status(201).json(borrowRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật trạng thái yêu cầu mượn sách
const updateBorrowRequest = async (req, res) => {
  try {
    const { trangThai } = req.body;
    const request = await TheoDoiMuonSach.findById(req.params.id)
      .populate('maSach')
      .populate('maDocGia');

    if (!request) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu mượn sách' });
    }

    const book = await Sach.findById(request.maSach._id);
    if (!book) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }

    // Cập nhật số lượng sách dựa trên trạng thái
    if (trangThai === 'Đã duyệt') {
      // Nếu duyệt, kiểm tra số lượng sách
      if (book.soQuyen <= 0) {
        return res.status(400).json({ message: 'Sách đã hết, không thể cho mượn' });
      }
      book.soQuyen -= 1; // Giảm số lượng sách
    } else if (trangThai === 'Đã trả' && request.trangThai === 'Đã duyệt') {
      // Nếu trả sách, tăng số lượng sách
      book.soQuyen += 1;
    }

    // Lưu thay đổi số lượng sách
    await book.save();
    // Cập nhật trạng thái yêu cầu
    request.trangThai = trangThai;
    // Nếu trạng thái là Đã trả, cập nhật ngày trả
    if (trangThai === 'Đã trả') {
      request.ngayTra = new Date();
    }

    // Lưu yêu cầu đã cập nhật
    await request.save();

    // Trả về thông tin yêu cầu và số lượng sách đã cập nhật
    const response = {
      ...request.toObject(),
      maSach: {
        ...request.maSach.toObject(),
        soQuyen: book.soQuyen
      }
    };

    return res.json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllBorrowRequests,
  getReaderBorrowHistory,
  createBorrowRequest,
  updateBorrowRequest
};