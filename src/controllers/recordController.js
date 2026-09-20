const prisma = require('../db');

// 將字串或數字安全轉成浮點數，空值轉為 null
function parseOptionalFloat(val) {
  if (val === undefined || val === null || val === '') return null;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? null : parsed;
}

// 取得所有記錄 (依日期由新至舊排序)
async function getAllRecords(req, res) {
  try {
    const records = await prisma.bodyRecord.findMany({
      orderBy: {
        date: 'desc',
      },
    });
    res.json({ success: true, data: records });
  } catch (error) {
    console.error('取得記錄失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤，無法取得記錄' });
  }
}

// 取得最新一筆與前一筆記錄 (供儀表板差值計算)
async function getLatestStats(req, res) {
  try {
    const records = await prisma.bodyRecord.findMany({
      take: 2,
      orderBy: {
        date: 'desc',
      },
    });

    const latest = records[0] || null;
    const previous = records[1] || null;

    res.json({
      success: true,
      data: {
        latest,
        previous,
      },
    });
  } catch (error) {
    console.error('取得最新體態失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
}

// 新增一筆身體記錄
async function createRecord(req, res) {
  try {
    const {
      date,
      height,
      weight,
      bodyFat,
      shoulder,
      chest,
      waist,
      hips,
      armLeft,
      armRight,
      thighLeft,
      thighRight,
      calfLeft,
      calfRight,
      notes,
    } = req.body;

    // 身高與體重為必填基礎資料
    const parsedHeight = parseFloat(height);
    const parsedWeight = parseFloat(weight);

    if (isNaN(parsedHeight) || parsedHeight <= 0) {
      return res.status(400).json({ success: false, message: '請提供有效的身高 (公分)' });
    }
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      return res.status(400).json({ success: false, message: '請提供有效的體重 (公斤)' });
    }

    const recordDate = date ? new Date(date) : new Date();

    const newRecord = await prisma.bodyRecord.create({
      data: {
        date: recordDate,
        height: parsedHeight,
        weight: parsedWeight,
        bodyFat: parseOptionalFloat(bodyFat),
        shoulder: parseOptionalFloat(shoulder),
        chest: parseOptionalFloat(chest),
        waist: parseOptionalFloat(waist),
        hips: parseOptionalFloat(hips),
        armLeft: parseOptionalFloat(armLeft),
        armRight: parseOptionalFloat(armRight),
        thighLeft: parseOptionalFloat(thighLeft),
        thighRight: parseOptionalFloat(thighRight),
        calfLeft: parseOptionalFloat(calfLeft),
        calfRight: parseOptionalFloat(calfRight),
        notes: notes ? String(notes).trim() : null,
      },
    });

    res.status(201).json({ success: true, data: newRecord });
  } catch (error) {
    console.error('新增記錄失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤，無法新增記錄' });
  }
}

// 更新特定記錄
async function updateRecord(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: '無效的記錄 ID' });
    }

    const {
      date,
      height,
      weight,
      bodyFat,
      shoulder,
      chest,
      waist,
      hips,
      armLeft,
      armRight,
      thighLeft,
      thighRight,
      calfLeft,
      calfRight,
      notes,
    } = req.body;

    const dataToUpdate = {};
    if (date !== undefined) dataToUpdate.date = new Date(date);
    if (height !== undefined) dataToUpdate.height = parseFloat(height);
    if (weight !== undefined) dataToUpdate.weight = parseFloat(weight);
    if (bodyFat !== undefined) dataToUpdate.bodyFat = parseOptionalFloat(bodyFat);
    if (shoulder !== undefined) dataToUpdate.shoulder = parseOptionalFloat(shoulder);
    if (chest !== undefined) dataToUpdate.chest = parseOptionalFloat(chest);
    if (waist !== undefined) dataToUpdate.waist = parseOptionalFloat(waist);
    if (hips !== undefined) dataToUpdate.hips = parseOptionalFloat(hips);
    if (armLeft !== undefined) dataToUpdate.armLeft = parseOptionalFloat(armLeft);
    if (armRight !== undefined) dataToUpdate.armRight = parseOptionalFloat(armRight);
    if (thighLeft !== undefined) dataToUpdate.thighLeft = parseOptionalFloat(thighLeft);
    if (thighRight !== undefined) dataToUpdate.thighRight = parseOptionalFloat(thighRight);
    if (calfLeft !== undefined) dataToUpdate.calfLeft = parseOptionalFloat(calfLeft);
    if (calfRight !== undefined) dataToUpdate.calfRight = parseOptionalFloat(calfRight);
    if (notes !== undefined) dataToUpdate.notes = notes ? String(notes).trim() : null;

    const updated = await prisma.bodyRecord.update({
      where: { id },
      data: dataToUpdate,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('更新記錄失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤，無法更新記錄' });
  }
}

// 刪除特定記錄
async function deleteRecord(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: '無效的記錄 ID' });
    }

    await prisma.bodyRecord.delete({
      where: { id },
    });

    res.json({ success: true, message: '記錄已成功刪除' });
  } catch (error) {
    console.error('刪除記錄失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤，無法刪除記錄' });
  }
}

module.exports = {
  getAllRecords,
  getLatestStats,
  createRecord,
  updateRecord,
  deleteRecord,
};
