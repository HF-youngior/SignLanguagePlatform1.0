import express from 'express';
import { query } from '../config/mysql.js';
import { protect } from '../middleware/auth_mysql.js';

const router = express.Router();

// 获取用户通知列表
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE user_id = ?';
    const params = [userId];

    if (type) {
      whereClause += ' AND type = ?';
      params.push(type);
    }

    const notifications = await query(
      `SELECT * FROM notifications 
       ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
      params
    );

    // 获取未读通知数量
    const unreadCount = await query(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE user_id = ? AND is_read = false`,
      [userId]
    );

    // 获取各类通知的未读数量
    const likeUnreadCount = await query(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE user_id = ? AND is_read = false AND type IN ('like', 'comment')`,
      [userId]
    );

    const friendUnreadCount = await query(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE user_id = ? AND is_read = false AND type IN ('friend_request', 'friend_accept')`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount: unreadCount[0].count,
        likeUnreadCount: likeUnreadCount[0].count,
        friendUnreadCount: friendUnreadCount[0].count,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: unreadCount[0].count
        }
      }
    });
  } catch (error) {
    console.error('获取通知列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取通知列表失败'
    });
  }
});

// 标记通知为已读
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await query(
      'UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({
      success: true,
      message: '已标记为已读'
    });
  } catch (error) {
    console.error('标记通知已读错误:', error);
    res.status(500).json({
      success: false,
      message: '操作失败'
    });
  }
});

// 标记所有通知为已读
router.patch('/read-all', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = '' } = req.body;

    let whereClause = 'WHERE user_id = ? AND is_read = false';
    const params = [userId];

    if (type) {
      if (type === 'likes') {
        whereClause += ' AND type IN ("like", "comment")';
      } else if (type === 'friends') {
        whereClause += ' AND type IN ("friend_request", "friend_accept")';
      }
    }

    await query(
      `UPDATE notifications SET is_read = true ${whereClause}`,
      params
    );

    res.json({
      success: true,
      message: '已全部标记为已读'
    });
  } catch (error) {
    console.error('标记全部已读错误:', error);
    res.status(500).json({
      success: false,
      message: '操作失败'
    });
  }
});

// 删除通知
router.delete('/:id', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await query(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({
      success: true,
      message: '通知已删除'
    });
  } catch (error) {
    console.error('删除通知错误:', error);
    res.status(500).json({
      success: false,
      message: '删除失败'
    });
  }
});

export default router;
