const mongoose = require('mongoose');

const theoDoiMuonSachSchema = new mongoose.Schema({
  maDocGia: { type: mongoose.Schema.Types.ObjectId, ref: 'DocGia', required: true },
  maSach: { type: mongoose.Schema.Types.ObjectId, ref: 'Sach', required: true },
  ngayMuon: { type: Date, default: Date.now, required: true },
  ngayHenTra: { type: Date, required: true }, // Thêm ngày hẹn trả
  ngayTra: { type: Date },
  tienPhat: { type: Number, default: 0 }, // Thêm số tiền phạt
  soNgayTre: { type: Number, default: 0 }, // Thêm số ngày trễ
  trangThai: {
    type: String,
    enum: ['Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Đã trả'],
    default: 'Chờ duyệt'
  }
}, {
  timestamps: true
});

// Middleware tính toán phạt trước khi lưu
theoDoiMuonSachSchema.pre('save', function (next) {
  // Chỉ tính phạt khi trạng thái là "Đã trả" và có ngày trả
  if (this.trangThai === 'Đã trả' && this.ngayTra && this.ngayHenTra) {
    const ngayTra = new Date(this.ngayTra);
    const ngayHenTra = new Date(this.ngayHenTra);

    // Tính số ngày trễ
    const timeDiff = ngayTra - ngayHenTra;
    const soNgayTre = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));

    this.soNgayTre = soNgayTre;
    this.tienPhat = soNgayTre * 3000; // 3000 VNĐ mỗi ngày trễ
  }
  next();
});

// Method tính phạt động
theoDoiMuonSachSchema.methods.tinhPhat = function () {
  if (this.ngayTra && this.ngayHenTra) {
    const ngayTra = new Date(this.ngayTra);
    const ngayHenTra = new Date(this.ngayHenTra);
    const timeDiff = ngayTra - ngayHenTra;
    const soNgayTre = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));

    return {
      soNgayTre,
      tienPhat: soNgayTre * 3000
    };
  }
  return { soNgayTre: 0, tienPhat: 0 };
};

module.exports = mongoose.model('TheoDoiMuonSach', theoDoiMuonSachSchema);