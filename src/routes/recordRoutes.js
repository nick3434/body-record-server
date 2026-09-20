const express = require('express');
const router = express.Router();
const {
  getAllRecords,
  getLatestStats,
  createRecord,
  updateRecord,
  deleteRecord,
} = require('../controllers/recordController');

// 路由定義
router.get('/', getAllRecords);
router.get('/stats', getLatestStats);
router.post('/', createRecord);
router.put('/:id', updateRecord);
router.delete('/:id', deleteRecord);

module.exports = router;
