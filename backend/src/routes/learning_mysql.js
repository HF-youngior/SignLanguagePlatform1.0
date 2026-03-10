import express from 'express';
import { query } from '../config/mysql.js';
import { protect } from '../middleware/auth_mysql.js';

const router = express.Router();

// 获取学习课程列表
router.get('/courses', async (req, res) => {
  try {
    // 这里可以返回静态的课程数据
    // 实际应用中应该从数据库获取
    res.json({
      success: true,
      data: {
        courses: [
          {
            id: 'basic-signs',
            title: '基础手语',
            description: '学习基础手语词汇',
            lessons: 10,
            difficulty: 'beginner'
          },
          {
            id: 'finger-spelling',
            title: '手指拼写',
            description: '学习字母和数字的手指拼写',
            lessons: 26,
            difficulty: 'beginner'
          },
          {
            id: 'daily-communication',
            title: '日常交流',
            description: '日常用语和对话',
            lessons: 15,
            difficulty: 'intermediate'
          }
        ]
      }
    });
  } catch (error) {
    console.error('获取课程列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取课程列表失败'
    });
  }
});

// 获取用户学习统计
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await query(
      `SELECT 
        COUNT(*) as total_lessons,
        SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed_lessons,
        SUM(time_spent) as total_time_spent,
        AVG(score) as average_score
       FROM learning_records 
       WHERE user_id = ?`,
      [userId]
    );
    
    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('获取学习统计错误:', error);
    res.status(500).json({
      success: false,
      message: '获取学习统计失败'
    });
  }
});

export default router;