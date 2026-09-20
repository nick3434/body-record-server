const express = require('express');
const router = express.Router();
const {
  getAllRecords,
  getLatestStats,
  createRecord,
  updateRecord,
  deleteRecord,
} = require('../controllers/recordController');
const { authenticate } = require('../middleware/authMiddleware');

// 記錄操作全部需要登入身分驗證
router.use(authenticate);

router.get('/', getAllRecords);
router.get('/stats', getLatestStats);
router.post('/', createRecord);
router.put('/:id', updateRecord);
router.delete('/:id', deleteRecord);

module.exports = router;
