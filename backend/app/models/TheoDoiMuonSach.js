const mongoose = require('mongoose');

const theoDoiMuonSachSchema = new mongoose.Schema({
  maDocGia: { type: mongoose.Schema.Types.ObjectId, ref: 'DocGia', required: true },
  maSach: { type: mongoose.Schema.Types.ObjectId, ref: 'Sach', required: true },
  ngayMuon: { type: Date, default: Date.now, required: true },
  ngayTra: { type: Date },
  trangThai: {
    type: String,
    enum: ['Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Đã trả'],
    default: 'Chờ duyệt'
  }
});

module.exports = mongoose.model('TheoDoiMuonSach', theoDoiMuonSachSchema);
