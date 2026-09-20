const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'body-record-secret-key-2026';

// 驗證 JWT Token 中間件
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '未授權，請先登入' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // 包含 id, username, name, role
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: '登入權杖無效或已過期，請重新登入' });
  }
}

// 僅允許管理員 (ADMIN) 存取的中介軟體
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: '權限不足，僅系統管理員 (ADMIN) 可執行此操作' });
  }
  next();
}

module.exports = {
  JWT_SECRET,
  authenticate,
  requireAdmin,
};
