import express from 'express';
import { query } from '../config/mysql.js';
import { protect } from '../middleware/auth_mysql.js';

const router = express.Router();

// 保存翻译记录
router.post('/record', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { inputType, inputContent, result, confidence, modelUsed, processingTime } = req.body;
    
    const insertResult = await query(
      `INSERT INTO translation_records 
       (user_id, input_type, input_content, result, confidence, model_used, processing_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, inputType, inputContent, result, confidence, modelUsed, processingTime]
    );
    
    res.json({
      success: true,
      message: '翻译记录保存成功',
      data: { id: insertResult.insertId }
    });
  } catch (error) {
    console.error('保存翻译记录错误:', error);
    res.status(500).json({
      success: false,
      message: '保存翻译记录失败'
    });
  }
});

// 获取翻译记录
router.get('/records', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const records = await query(
      `SELECT * FROM translation_records 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );
    
    const countResult = await query(
      'SELECT COUNT(*) as total FROM translation_records WHERE user_id = ?',
      [userId]
    );
    
    res.json({
      success: true,
      data: {
        records,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取翻译记录错误:', error);
    res.status(500).json({
      success: false,
      message: '获取翻译记录失败'
    });
  }
});

export default router;