import express from 'express';
import { query } from '../config/mysql.js';
import { protect } from '../middleware/auth_mysql.js';

const router = express.Router();

// 获取用户学习进度
router.get('/learning-progress', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const records = await query(
      `SELECT * FROM learning_records 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );
    
    const stats = await query(
      `SELECT 
        COUNT(*) as total_lessons,
        SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed_lessons,
        SUM(time_spent) as total_time_spent
       FROM learning_records 
       WHERE user_id = ?`,
      [userId]
    );
    
    res.json({
      success: true,
      data: {
        records,
        stats: stats[0]
      }
    });
  } catch (error) {
    console.error('获取学习进度错误:', error);
    res.status(500).json({
      success: false,
      message: '获取学习进度失败'
    });
  }
});

// 更新学习记录
router.post('/learning-progress', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { lessonType, lessonId, lessonName, completed, score, timeSpent } = req.body;
    
    // 检查是否已存在记录
    const existing = await query(
      'SELECT id FROM learning_records WHERE user_id = ? AND lesson_type = ? AND lesson_id = ?',
      [userId, lessonType, lessonId]
    );
    
    if (existing.length > 0) {
      // 更新记录
      await query(
        `UPDATE learning_records 
         SET completed = ?, score = ?, time_spent = time_spent + ?, completed_at = ?
         WHERE id = ?`,
        [completed, score || null, timeSpent || 0, completed ? new Date() : null, existing[0].id]
      );
    } else {
      // 创建新记录
      await query(
        `INSERT INTO learning_records 
         (user_id, lesson_type, lesson_id, lesson_name, completed, score, time_spent, completed_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, lessonType, lessonId, lessonName, completed, score || null, timeSpent || 0, completed ? new Date() : null]
      );
    }
    
    res.json({
      success: true,
      message: '学习记录更新成功'
    });
  } catch (error) {
    console.error('更新学习记录错误:', error);
    res.status(500).json({
      success: false,
      message: '更新学习记录失败'
    });
  }
});

// 获取用户翻译历史
router.get('/translation-history', protect, async (req, res) => {
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
    console.error('获取翻译历史错误:', error);
    res.status(500).json({
      success: false,
      message: '获取翻译历史失败'
    });
  }
});

// 获取用户个人资料
router.get('/profile', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await query(
      `SELECT id, username, email, first_name, last_name, avatar, bio, role, 
              created_at, last_login 
       FROM users 
       WHERE id = ?`,
      [userId]
    );
    
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 获取用户统计信息
    const postCount = await query(
      'SELECT COUNT(*) as count FROM posts WHERE author_id = ? AND is_deleted = false',
      [userId]
    );
    
    const commentCount = await query(
      'SELECT COUNT(*) as count FROM comments WHERE user_id = ? AND is_deleted = false',
      [userId]
    );
    
    const likeCount = await query(
      `SELECT COUNT(*) as count FROM likes WHERE user_id = ?`,
      [userId]
    );
    
    // 获取好友数量（假设有friends表）
    let friendCount = { count: 0 };
    try {
      friendCount = await query(
        `SELECT COUNT(*) as count FROM friends 
         WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted'`,
        [userId, userId]
      );
    } catch (e) {
      // 好友表可能不存在，忽略错误
    }
    
    res.json({
      success: true,
      data: {
        ...user[0],
        stats: {
          posts: postCount[0].count,
          comments: commentCount[0].count,
          likes: likeCount[0].count,
          friends: friendCount[0]?.count || 0
        }
      }
    });
  } catch (error) {
    console.error('获取用户资料错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户资料失败'
    });
  }
});

// 获取其他用户个人资料
router.get('/profile/:id', protect, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;
    
    const user = await query(
      `SELECT id, username, first_name, last_name, avatar, bio, role, 
              created_at, last_login 
       FROM users 
       WHERE id = ?`,
      [targetUserId]
    );
    
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 获取用户统计信息
    const postCount = await query(
      'SELECT COUNT(*) as count FROM posts WHERE author_id = ? AND is_deleted = false',
      [targetUserId]
    );
    
    const commentCount = await query(
      'SELECT COUNT(*) as count FROM comments WHERE user_id = ? AND is_deleted = false',
      [targetUserId]
    );
    
    const likeCount = await query(
      `SELECT COUNT(*) as count FROM likes WHERE user_id = ?`,
      [targetUserId]
    );
    
    // 获取好友数量（假设有friends表）
    let friendCount = { count: 0 };
    try {
      friendCount = await query(
        `SELECT COUNT(*) as count FROM friends 
         WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted'`,
        [targetUserId, targetUserId]
      );
    } catch (e) {
      // 好友表可能不存在，忽略错误
    }
    
    // 检查是否是当前用户
    const isCurrentUser = currentUserId === targetUserId;
    
    // 检查是否已经是好友
    let isFriend = false;
    try {
      const friendResult = await query(
        `SELECT id FROM friends 
         WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)) 
         AND status = 'accepted'`,
        [currentUserId, targetUserId, targetUserId, currentUserId]
      );
      isFriend = friendResult.length > 0;
    } catch (e) {
      // 好友表可能不存在，忽略错误
    }
    
    res.json({
      success: true,
      data: {
        user: {
          ...user[0],
          postsCount: postCount[0].count,
          friendsCount: friendCount[0]?.count || 0,
          likesCount: likeCount[0].count
        },
        isCurrentUser,
        isFriend
      }
    });
  } catch (error) {
    console.error('获取用户资料错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户资料失败'
    });
  }
});

// 更新用户个人资料
router.put('/profile', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, bio, avatar } = req.body;
    
    console.log('更新用户资料:', { userId, first_name, bio: bio ? '有内容' : '无内容', avatar: avatar ? `有头像数据(${avatar.length}字符)` : '无头像' });
    
    // 将undefined值替换为null
    const safeFirstName = first_name !== undefined ? first_name : null;
    const safeLastName = last_name !== undefined ? last_name : null;
    const safeBio = bio !== undefined ? bio : null;
    const safeAvatar = avatar !== undefined ? avatar : null;
    
    await query(
      `UPDATE users 
       SET first_name = ?, last_name = ?, bio = ?, avatar = ? 
       WHERE id = ?`,
      [safeFirstName, safeLastName, safeBio, safeAvatar, userId]
    );
    
    console.log('用户资料更新成功');
    
    res.json({
      success: true,
      message: '个人资料更新成功'
    });
  } catch (error) {
    console.error('更新用户资料错误:', error);
    res.status(500).json({
      success: false,
      message: '更新用户资料失败'
    });
  }
});

// 获取用户帖子
router.get('/posts', protect, async (req, res) => {
  try {
    const userId = req.query.userId || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // 获取当前用户ID（如果已登录）
    const token = req.headers.authorization?.split(' ')[1];
    let currentUserId = null;
    if (token) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        currentUserId = decoded.id;
      } catch (e) {
        // token无效，忽略
      }
    }
    
    const posts = await query(
      `SELECT p.*, u.username, u.first_name, u.avatar,
              (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = false) as comments_count,
              (SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = p.id) as likes_count
       FROM posts p 
       JOIN users u ON p.author_id = u.id
       WHERE p.author_id = ? AND p.is_deleted = false
       ORDER BY p.created_at DESC 
       LIMIT ${limit} OFFSET ${offset}`,
      [userId]
    );
    
    // 为每个帖子检查是否已点赞
    const postsWithLikeStatus = await Promise.all(posts.map(async (post) => {
      let isLiked = false;
      if (currentUserId) {
        const likeResult = await query(
          'SELECT id FROM likes WHERE target_type = ? AND target_id = ? AND user_id = ?',
          ['post', post.id, currentUserId]
        );
        isLiked = likeResult.length > 0;
      }
      return {
        ...post,
        // 优先使用first_name（昵称）
        username: post.first_name || post.username,
        isLiked
      };
    }));
    
    const countResult = await query(
      'SELECT COUNT(*) as total FROM posts WHERE author_id = ? AND is_deleted = false',
      [userId]
    );
    
    res.json({
      success: true,
      data: {
        posts: postsWithLikeStatus,
        pagination: {
          page: page,
          limit: limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取用户帖子错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户帖子失败'
    });
  }
});

// 添加好友
router.post('/friends/:id', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const friendId = req.params.id;
    
    // 检查是否是自己
    if (userId === friendId) {
      return res.status(400).json({
        success: false,
        message: '不能添加自己为好友'
      });
    }
    
    // 检查用户是否存在
    const userExists = await query(
      'SELECT id FROM users WHERE id = ?',
      [friendId]
    );
    
    if (userExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 检查是否已经是好友或有未处理的请求
    const existingFriendship = await query(
      `SELECT id, status FROM friends 
       WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`,
      [userId, friendId, friendId, userId]
    );
    
    if (existingFriendship.length > 0) {
      if (existingFriendship[0].status === 'accepted') {
        return res.status(400).json({
          success: false,
          message: '已经是好友了'
        });
      } else {
        return res.status(400).json({
          success: false,
          message: '好友请求已发送，等待对方确认'
        });
      }
    }
    
    // 发送好友请求
    await query(
      `INSERT INTO friends (user_id, friend_id, status) 
       VALUES (?, ?, 'pending')`,
      [userId, friendId]
    );
    
    // 创建通知
    try {
      await query(
        `INSERT INTO notifications (user_id, sender_id, type, target_type, target_id, content)
         VALUES (?, ?, 'friend_request', 'user', ?, ?)`,
        [friendId, userId, userId, '发送了好友请求']
      );
    } catch (notifyError) {
      console.error('创建好友请求通知失败:', notifyError);
      // 不影响好友请求操作
    }
    
    res.json({
      success: true,
      message: '好友请求已发送'
    });
  } catch (error) {
    console.error('添加好友错误:', error);
    res.status(500).json({
      success: false,
      message: '添加好友失败'
    });
  }
});

export default router;