require('dotenv').config();
const express = require('express');
const cors = require('cors');
const recordRoutes = require('./routes/recordRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 中間件設定
app.use(cors({
  origin: '*', // 開發階段允許前端 Vite 5173 存取
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// API 路由掛載
app.use('/api/records', recordRoutes);

// 健康檢查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'body-record-api'
  });
});

// 404 處理
app.use((req, res) => {
  res.status(404).json({ success: false, message: '找不到該端點' });
});

// 全域錯誤處理
app.use((err, req, res, next) => {
  console.error('伺服器未捕捉錯誤:', err);
  res.status(500).json({
    success: false,
    message: '內部伺服器錯誤',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 身體記錄後端伺服器已啟動: http://localhost:${PORT}`);
});
