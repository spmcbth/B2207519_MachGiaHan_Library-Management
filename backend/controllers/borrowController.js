const TheoDoiMuonSach = require('../models/TheoDoiMuonSach');
const Sach = require('../models/Sach');

// Lấy danh sách tất cả yêu cầu mượn sách
const getAllBorrowRequests = async (req, res) => {
  try {
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
    // Tính ngày hẹn trả (mặc định sau 14 ngày)
    const ngayHenTra = new Date();
    ngayHenTra.setDate(ngayHenTra.getDate() + 14);

    const borrowRequest = new TheoDoiMuonSach({
      maDocGia: req.user._id,
      maSach: req.body.maSach,
      ngayMuon: new Date(),
      ngayHenTra: ngayHenTra,
      trangThai: 'Chờ duyệt'
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
      if (book.soQuyen <= 0) {
        return res.status(400).json({ message: 'Sách đã hết, không thể cho mượn' });
      }
      book.soQuyen -= 1;

      // Nếu chưa có ngày hẹn trả, tạo mới (14 ngày từ khi duyệt)
      if (!request.ngayHenTra) {
        const ngayHenTra = new Date();
        ngayHenTra.setDate(ngayHenTra.getDate() + 14);
        request.ngayHenTra = ngayHenTra;
      }
    } else if (trangThai === 'Đã trả' && request.trangThai === 'Đã duyệt') {
      book.soQuyen += 1;
      // Cập nhật ngày trả và tính phạt
      request.ngayTra = new Date();

      // Tính toán phạt tự động thông qua middleware
      const phatInfo = request.tinhPhat();
      request.soNgayTre = phatInfo.soNgayTre;
      request.tienPhat = phatInfo.tienPhat;
    }

    await book.save();
    request.trangThai = trangThai;
    await request.save();

    // Trả về thông tin yêu cầu với thông tin phạt
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

// Thêm API mới để lấy thống kê phạt
const getPenaltyStatistics = async (req, res) => {
  try {
    const statistics = await TheoDoiMuonSach.aggregate([
      {
        $match: {
          trangThai: 'Đã trả',
          tienPhat: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          tongTienPhat: { $sum: '$tienPhat' },
          tongSoTruongHopTre: { $sum: 1 },
          trungBinhNgayTre: { $avg: '$soNgayTre' }
        }
      }
    ]);

    res.json(statistics[0] || {
      tongTienPhat: 0,
      tongSoTruongHopTre: 0,
      trungBinhNgayTre: 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// API lấy danh sách trả sách trễ
const getOverdueReturns = async (req, res) => {
  try {
    const overdueReturns = await TheoDoiMuonSach.find({
      trangThai: 'Đã trả',
      tienPhat: { $gt: 0 }
    })
      .populate('maDocGia', 'hoLot ten maDocGia')
      .populate('maSach', 'tenSach maSach')
      .sort({ ngayTra: -1 });

    res.json(overdueReturns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// **THÊM MỚI** - API lấy danh sách sách đang quá hạn (chưa trả)
const getCurrentOverdueBooks = async (req, res) => {
  try {
    const currentDate = new Date();

    const overdueBooks = await TheoDoiMuonSach.find({
      trangThai: 'Đã duyệt',
      ngayHenTra: { $lt: currentDate }
    })
      .populate('maDocGia', 'hoLot ten maDocGia email soDienThoai')
      .populate('maSach', 'tenSach maSach')
      .sort({ ngayHenTra: 1 }); // Sắp xếp theo ngày hẹn trả cũ nhất

    // Tính số ngày quá hạn cho mỗi sách
    const overdueWithDays = overdueBooks.map(book => {
      const timeDiff = currentDate - new Date(book.ngayHenTra);
      const daysOverdue = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      const estimatedPenalty = daysOverdue * 3000;

      return {
        ...book.toObject(),
        soNgayQuaHan: daysOverdue,
        tienPhatDuKien: estimatedPenalty
      };
    });

    res.json(overdueWithDays);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// **THÊM MỚI** - API thống kê tổng quan
const getLibraryStatistics = async (req, res) => {
  try {
    const [
      totalBorrowed,
      totalReturned,
      totalOverdue,
      totalPenalty,
      currentOverdue
    ] = await Promise.all([
      TheoDoiMuonSach.countDocuments({ trangThai: 'Đã duyệt' }),
      TheoDoiMuonSach.countDocuments({ trangThai: 'Đã trả' }),
      TheoDoiMuonSach.countDocuments({
        trangThai: 'Đã trả',
        tienPhat: { $gt: 0 }
      }),
      TheoDoiMuonSach.aggregate([
        { $match: { trangThai: 'Đã trả', tienPhat: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$tienPhat' } } }
      ]),
      TheoDoiMuonSach.countDocuments({
        trangThai: 'Đã duyệt',
        ngayHenTra: { $lt: new Date() }
      })
    ]);

    res.json({
      tongSoSachDaMuon: totalBorrowed,
      tongSoSachDaTra: totalReturned,
      tongSoLanTraTre: totalOverdue,
      tongTienPhat: totalPenalty[0]?.total || 0,
      soSachDangQuaHan: currentOverdue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllBorrowRequests,
  getReaderBorrowHistory,
  createBorrowRequest,
  updateBorrowRequest,
  getPenaltyStatistics,
  getOverdueReturns,
  getCurrentOverdueBooks,     // API mới
  getLibraryStatistics        // API mới
};