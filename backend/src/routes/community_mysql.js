import express from 'express';
import { query } from '../config/mysql.js';
import { protect } from '../middleware/auth_mysql.js';

const router = express.Router();

// 获取帖子列表
router.get('/posts', async (req, res) => {
  try {
    const { page = 1, limit = 10, category = '' } = req.query;
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
    
    let whereClause = 'WHERE p.is_deleted = false';
    const params = [];
    
    if (category) {
      whereClause += ' AND p.category = ?';
      params.push(category);
    }
    
    const posts = await query(
      `SELECT p.*, u.username, u.first_name, u.avatar,
              (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = false) as comments_count,
              (SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = p.id) as likes_count
       FROM posts p
       JOIN users u ON p.author_id = u.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
    );
    
    // 为每个帖子获取所有评论
    const postsWithComments = await Promise.all(posts.map(async (post) => {
      const comments = await query(
        `SELECT c.*, u.username as user_username, u.first_name as user_first_name, u.avatar as user_avatar
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.post_id = ? AND c.is_deleted = false AND c.parent_id IS NULL
         ORDER BY c.created_at ASC`,
        [post.id]
      );
      
      // 为每条评论获取所有回复
      const commentsWithReplies = await Promise.all(comments.map(async (comment) => {
        const replies = await query(
          `SELECT r.*, u.username as user_username, u.first_name as user_first_name, u.avatar as user_avatar
           FROM comments r
           JOIN users u ON r.user_id = u.id
           WHERE r.parent_id = ? AND r.is_deleted = false
           ORDER BY r.created_at ASC`,
          [comment.id]
        );
        
        return {
          ...comment,
          user_id: comment.user_id,
          username: comment.user_first_name || comment.user_username,
          avatar: comment.user_avatar,
          time: comment.created_at,
          replies: replies.map(r => ({
            ...r,
            user_id: r.user_id,
            username: r.user_first_name || r.user_username,
            avatar: r.user_avatar,
            time: r.created_at,
            replyTo: comment.user_first_name || comment.user_username
          }))
        };
      }));
      
      // 检查当前用户是否点赞
      let isLiked = false;
      if (currentUserId) {
        const likeResult = await query(
          'SELECT id FROM likes WHERE target_type = ? AND target_id = ? AND user_id = ?',
          ['post', post.id, currentUserId]
        );
        isLiked = likeResult.length > 0;
      }
      
      // 安全解析JSON字段
      let hashtags = [];
      let images = [];
      let videos = [];
      
      try {
        if (post.hashtags) {
          // 尝试作为JSON解析
          try {
            hashtags = JSON.parse(post.hashtags);
          } catch (jsonError) {
            // 如果不是JSON格式，尝试作为逗号分隔的字符串处理
            console.log('Hashtags不是JSON格式，尝试作为逗号分隔字符串处理');
            hashtags = post.hashtags.split(',').map(tag => tag.trim()).filter(tag => tag);
          }
        }
      } catch (e) {
        console.error('解析hashtags失败:', e);
        hashtags = [];
      }
      
      try {
        images = post.images ? JSON.parse(post.images) : [];
      } catch (e) {
        console.error('解析images失败:', e);
        images = [];
      }
      
      try {
        videos = post.videos ? JSON.parse(post.videos) : [];
      } catch (e) {
        console.error('解析videos失败:', e);
        videos = [];
      }
      
      return {
        ...post,
        // 优先使用first_name（昵称），如果没有则使用username
        username: post.first_name || post.username,
        hashtags: hashtags,
        images: images,
        videos: videos,
        commentList: commentsWithReplies,
        isLiked: isLiked
      };
    }));
    
    const countResult = await query(
      `SELECT COUNT(*) as total FROM posts p ${whereClause}`,
      params
    );
    
    res.json({
      success: true,
      data: {
        posts: postsWithComments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取帖子列表错误:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      success: false,
      message: '获取帖子列表失败',
      error: error.message
    });
  }
});

// 获取单个帖子
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const posts = await query(
      `SELECT p.*, u.username as author_username, u.first_name as author_first_name, u.avatar as author_avatar
       FROM posts p
       JOIN users u ON p.author_id = u.id
       WHERE p.id = ? AND p.is_deleted = false`,
      [id]
    );
    
    if (posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }
    
    const post = posts[0];
    
    // 获取一级评论（parent_id为NULL的评论）
    const topLevelComments = await query(
      `SELECT c.*, u.username as user_username, u.avatar as user_avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ? AND c.is_deleted = false AND c.parent_id IS NULL
       ORDER BY c.created_at ASC`,
      [id]
    );
    
    // 为每条一级评论获取回复
    const commentsWithReplies = await Promise.all(topLevelComments.map(async (comment) => {
      const replies = await query(
        `SELECT r.*, u.username as user_username, u.avatar as user_avatar
         FROM comments r
         JOIN users u ON r.user_id = u.id
         WHERE r.parent_id = ? AND r.is_deleted = false
         ORDER BY r.created_at ASC`,
        [comment.id]
      );
      
      return {
        ...comment,
        user_username: comment.user_username,
        user_avatar: comment.user_avatar,
        replies: replies.map(r => ({
          ...r,
          user_username: r.user_username,
          user_avatar: r.user_avatar
        }))
      };
    }));
    
    // 增加浏览量 (忽略由于数据库只读导致的错误)
    try {
      await query(
        'UPDATE posts SET views = views + 1 WHERE id = ?',
        [id]
      );
    } catch (updateError) {
      console.warn('增加浏览量失败, 可能数据库处于只读模式:', updateError.message);
    }
    
    res.json({
      success: true,
      data: {
        post: {
          ...post,
          // 优先使用first_name（昵称）
          author_username: post.author_first_name || post.author_username,
          hashtags: post.hashtags ? JSON.parse(post.hashtags) : [],
          images: post.images ? JSON.parse(post.images) : [],
          videos: post.videos ? JSON.parse(post.videos) : []
        },
        comments: commentsWithReplies
      }
    });
  } catch (error) {
    console.error('获取帖子详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取帖子详情失败'
    });
  }
});

// 创建帖子
router.post('/posts', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { content, privacy, title = '新帖子' } = req.body;
    
    const result = await query(
      `INSERT INTO posts (author_id, title, content, category) 
       VALUES (?, ?, ?, ?)`,
      [userId, title, content, '其他']
    );
    
    res.status(201).json({
      success: true,
      message: '帖子创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('创建帖子错误:', error);
    res.status(500).json({
      success: false,
      message: '创建帖子失败'
    });
  }
});

// 添加评论
router.post('/posts/:id/comments', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { content, parentId } = req.body;
    
    const result = await query(
      `INSERT INTO comments (post_id, user_id, content, parent_id) 
       VALUES (?, ?, ?, ?)`,
      [id, userId, content, parentId || null]
    );
    
    // 获取帖子作者信息
    const postAuthor = await query(
      'SELECT author_id FROM posts WHERE id = ?',
      [id]
    );
    
    // 创建通知（如果不是给自己评论）
    if (postAuthor.length > 0 && postAuthor[0].author_id !== userId) {
      try {
        await query(
          `INSERT INTO notifications (user_id, sender_id, type, target_type, target_id, content)
           VALUES (?, ?, 'comment', 'post', ?, ?)`,
          [postAuthor[0].author_id, userId, id, content.substring(0, 50)]
        );
      } catch (notifyError) {
        console.error('创建评论通知失败:', notifyError);
        // 不影响评论操作
      }
    }
    
    // 如果是回复评论，通知被回复的人
    if (parentId) {
      const parentComment = await query(
        'SELECT user_id FROM comments WHERE id = ?',
        [parentId]
      );
      if (parentComment.length > 0 && parentComment[0].user_id !== userId) {
        try {
          await query(
            `INSERT INTO notifications (user_id, sender_id, type, target_type, target_id, content)
             VALUES (?, ?, 'comment', 'comment', ?, ?)`,
            [parentComment[0].user_id, userId, parentId, `回复了你的评论: ${content.substring(0, 50)}`]
          );
        } catch (notifyError) {
          console.error('创建回复通知失败:', notifyError);
        }
      }
    }
    
    res.status(201).json({
      success: true,
      message: '评论添加成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('添加评论错误:', error);
    res.status(500).json({
      success: false,
      message: '添加评论失败'
    });
  }
});

// 点赞帖子
router.post('/posts/:id/like', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // 检查是否已点赞
    const existing = await query(
      'SELECT id FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?',
      [userId, 'post', id]
    );
    
    if (existing.length > 0) {
      // 取消点赞
      await query(
        'DELETE FROM likes WHERE id = ?',
        [existing[0].id]
      );
      await query(
        'UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ?',
        [id]
      );
      
      // 获取最新的点赞数
      const postResult = await query(
        'SELECT likes_count FROM posts WHERE id = ?',
        [id]
      );
      
      res.json({
        success: true,
        message: '已取消点赞',
        data: { liked: false, likes_count: postResult[0]?.likes_count || 0 }
      });
    } else {
      // 添加点赞
      await query(
        'INSERT INTO likes (user_id, target_type, target_id) VALUES (?, ?, ?)',
        [userId, 'post', id]
      );
      await query(
        'UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?',
        [id]
      );
      
      // 获取最新的点赞数
      const postResult = await query(
        'SELECT likes_count FROM posts WHERE id = ?',
        [id]
      );
      
      // 获取帖子作者信息
      const postAuthor = await query(
        'SELECT author_id FROM posts WHERE id = ?',
        [id]
      );
      
      // 创建通知（如果不是给自己点赞）
      if (postAuthor.length > 0 && postAuthor[0].author_id !== userId) {
        try {
          await query(
            `INSERT INTO notifications (user_id, sender_id, type, target_type, target_id, content)
             VALUES (?, ?, 'like', 'post', ?, ?)`,
            [postAuthor[0].author_id, userId, id, '赞了你的帖子']
          );
        } catch (notifyError) {
          console.error('创建点赞通知失败:', notifyError);
          // 不影响点赞操作
        }
      }
      
      res.json({
        success: true,
        message: '点赞成功',
        data: { liked: true, likes_count: postResult[0]?.likes_count || 0 }
      });
    }
  } catch (error) {
    console.error('点赞错误:', error);
    res.status(500).json({
      success: false,
      message: '操作失败'
    });
  }
});

// 点赞评论（支持一级和二级评论）
router.post('/comments/:id/like', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // 检查是否已点赞
    const existing = await query(
      'SELECT id FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?',
      [userId, 'comment', id]
    );
    
    if (existing.length > 0) {
      // 取消点赞
      await query(
        'DELETE FROM likes WHERE id = ?',
        [existing[0].id]
      );
      
      res.json({
        success: true,
        message: '已取消点赞',
        data: { liked: false }
      });
    } else {
      // 添加点赞
      await query(
        'INSERT INTO likes (user_id, target_type, target_id) VALUES (?, ?, ?)',
        [userId, 'comment', id]
      );
      
      // 获取评论作者信息
      const commentAuthor = await query(
        'SELECT user_id FROM comments WHERE id = ?',
        [id]
      );
      
      // 创建通知（如果不是给自己点赞）
      if (commentAuthor.length > 0 && commentAuthor[0].user_id !== userId) {
        try {
          await query(
            `INSERT INTO notifications (user_id, sender_id, type, target_type, target_id, content)
             VALUES (?, ?, 'like', 'comment', ?, ?)`,
            [commentAuthor[0].user_id, userId, id, '赞了你的评论']
          );
        } catch (notifyError) {
          console.error('创建评论点赞通知失败:', notifyError);
          // 不影响点赞操作
        }
      }
      
      res.json({
        success: true,
        message: '点赞成功',
        data: { liked: true }
      });
    }
  } catch (error) {
    console.error('评论点赞错误:', error);
    res.status(500).json({
      success: false,
      message: '操作失败'
    });
  }
});

// 检查评论是否被点赞
router.get('/comments/:id/like', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const existing = await query(
      'SELECT id FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?',
      [userId, 'comment', id]
    );
    
    res.json({
      success: true,
      data: { liked: existing.length > 0 }
    });
  } catch (error) {
    console.error('检查评论点赞状态错误:', error);
    res.status(500).json({
      success: false,
      message: '操作失败'
    });
  }
});

// 更新帖子（包括权限）
router.put('/posts/:id', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { privacy, content, title } = req.body;
    
    // 检查帖子是否存在且属于当前用户
    const posts = await query(
      'SELECT * FROM posts WHERE id = ? AND author_id = ? AND is_deleted = false',
      [id, userId]
    );
    
    if (posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在或无权限修改'
      });
    }
    
    // 构建更新字段
    const updates = [];
    const values = [];
    
    if (privacy !== undefined) {
      updates.push('privacy = ?');
      values.push(privacy);
    }
    if (content !== undefined) {
      updates.push('content = ?');
      values.push(content);
    }
    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有要更新的内容'
      });
    }
    
    values.push(id);
    
    await query(
      `UPDATE posts SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    res.json({
      success: true,
      message: '帖子更新成功'
    });
  } catch (error) {
    console.error('更新帖子错误:', error);
    res.status(500).json({
      success: false,
      message: '更新帖子失败'
    });
  }
});

export default router;