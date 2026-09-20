const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

// 所有成員管理端點均需要登入且具備 ADMIN 權限
router.use(authenticate, requireAdmin);

router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
