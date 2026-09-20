const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// 系統啟動時檢查並初始化預設管理員帳號
async function initDefaultAdmin() {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('系統檢測到無任何帳號，正在自動建立預設管理員...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          name: '家庭管理員',
          role: 'ADMIN',
        },
      });
      console.log('✅ 預設管理員建立成功！帳號: admin, 密碼: admin123');

      // 將現有無關聯的舊記錄綁定至此管理員
      const orphanRecords = await prisma.bodyRecord.updateMany({
        where: { userId: null },
        data: { userId: admin.id },
      });
      if (orphanRecords.count > 0) {
        console.log(`✅ 已自動將 ${orphanRecords.count} 筆現有記錄關聯至管理員。`);
      }
    }
  } catch (err) {
    console.error('初始化管理員帳號失敗:', err);
  }
}

// 使用者登入
async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '請輸入帳號與密碼' });
    }

    const user = await prisma.user.findUnique({
      where: { username: username.trim().toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: '帳號或密碼錯誤' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '帳號或密碼錯誤' });
    }

    // 簽發 JWT Token (有效期限 7 天)
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (err) {
    console.error('登入錯誤:', err);
    res.status(500).json({ success: false, message: '伺服器內部錯誤' });
  }
}

// 取得當前登入者資訊
async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: '找不到使用者' });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    console.error('取得個人資料失敗:', err);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
}

module.exports = {
  initDefaultAdmin,
  login,
  getMe,
};
