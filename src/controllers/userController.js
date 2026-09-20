const bcrypt = require('bcryptjs');
const prisma = require('../db');

// 取得所有家庭成員清單 (包含記錄統計)
async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: { records: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    res.json({ success: true, data: users });
  } catch (err) {
    console.error('取得成員清單失敗:', err);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
}

// 新增家庭成員帳號
async function createUser(req, res) {
  try {
    const { username, password, name, role } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ success: false, message: '請完整填寫帳號、密碼與家人稱謂' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: '該帳號名稱已存在，請使用其他帳號' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role === 'ADMIN' ? 'ADMIN' : 'USER';

    const newUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        password: hashedPassword,
        name: name.trim(),
        role: assignedRole,
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({ success: true, data: newUser, message: '成員建立成功' });
  } catch (err) {
    console.error('建立成員失敗:', err);
    res.status(500).json({ success: false, message: '伺服器錯誤，無法建立成員' });
  }
}

// 修改家庭成員資料 (名稱、角色、重設密碼)
async function updateUser(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: '無效的用戶 ID' });
    }

    const { name, role, password } = req.body;
    const dataToUpdate = {};

    if (name) dataToUpdate.name = name.trim();
    if (role && (role === 'ADMIN' || role === 'USER')) {
      dataToUpdate.role = role;
    }
    if (password && password.trim().length > 0) {
      dataToUpdate.password = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    res.json({ success: true, data: updated, message: '成員資料已更新' });
  } catch (err) {
    console.error('更新成員失敗:', err);
    res.status(500).json({ success: false, message: '伺服器錯誤，無法更新成員' });
  }
}

// 刪除家庭成員帳號
async function deleteUser(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: '無效的用戶 ID' });
    }

    // 防止刪除當前登入者自己
    if (req.user.id === id) {
      return res.status(400).json({ success: false, message: '無法刪除自己目前登入的管理員帳號' });
    }

    await prisma.user.delete({
      where: { id },
    });

    res.json({ success: true, message: '成員已成功刪除' });
  } catch (err) {
    console.error('刪除成員失敗:', err);
    res.status(500).json({ success: false, message: '伺服器錯誤，無法刪除成員' });
  }
}

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
