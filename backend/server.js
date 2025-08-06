const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const sachRoutes = require('./routes/bookRoutes');
const nhaXuatBanRoutes = require('./routes/publisherRoutes');
const theoDoiMuonSachRoutes = require('./routes/borrowRoutes');
const nhanVienRoutes = require('./routes/staffRoutes');
const docGiaRoutes = require('./routes/userRoutes');
const tacGiaRoutes = require('./routes/authorRoutes');

const app = express();

connectDB(); // Kết nối đến cơ sở dữ liệu MongoDB

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sach', sachRoutes);
app.use('/api/nhaxuatban', nhaXuatBanRoutes);
app.use('/api/muonsach', theoDoiMuonSachRoutes);
app.use('/api/nhanvien', nhanVienRoutes);
app.use('/api/docgia', docGiaRoutes);
app.use('/api/tacgia', tacGiaRoutes);

// Static Frontend + Uploads ảnh
app.use(express.static('dist'));
app.use('/uploads', express.static('uploads'));

// Serve frontend (SPA)
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
