import { query, transaction } from '../config/mysql.js';
import bcrypt from 'bcryptjs';

// 获取所有用户（管理员）
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const safePage = isNaN(page) ? 1 : page;
    const safeLimit = isNaN(limit) ? 20 : limit;
    const offset = Math.max(0, (safePage - 1) * safeLimit);

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    // 获取用户列表
    const users = await query(
      `SELECT id, username, email, first_name, last_name, role, avatar, is_active, 
              created_at, last_login 
       FROM users ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    // 获取总数
    const countResult = await query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );

    // 格式化用户数据
    const formattedUsers = users.map(user => ({
      ...user
    }));

    res.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / safeLimit)
        }
      }
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败'
    });
  }
};

// 获取单个用户详情（管理员）
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const users = await query(
      `SELECT id, username, email, first_name, last_name, role, avatar, bio, 
              is_active, created_at, last_login 
       FROM users WHERE id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const user = users[0];

    // 获取用户的学习记录
    const learningRecords = await query(
      `SELECT * FROM learning_records WHERE user_id = ? ORDER BY created_at DESC`,
      [id]
    );

    // 获取用户的翻译记录
    const translationRecords = await query(
      `SELECT * FROM translation_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
      [id]
    );

    // 获取用户的帖子数
    const postCount = await query(
      `SELECT COUNT(*) as count FROM posts WHERE author_id = ? AND is_deleted = false`,
      [id]
    );

    // 获取用户的评论数
    const commentCount = await query(
      `SELECT COUNT(*) as count FROM comments WHERE user_id = ? AND is_deleted = false`,
      [id]
    );

    res.json({
      success: true,
      data: {
        user: {
          ...user
        },
        stats: {
          posts: postCount[0].count,
          comments: commentCount[0].count,
          learningRecords: learningRecords.length,
          translationRecords: translationRecords.length
        },
        learningRecords,
        translationRecords
      }
    });
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户详情失败'
    });
  }
};

// 更新用户角色（管理员）
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: '无效的角色类型'
      });
    }

    // 不能修改自己的角色
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: '不能修改自己的角色'
      });
    }

    await query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    );

    // 记录管理员操作
    await query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'UPDATE_USER_ROLE', 'user', id, JSON.stringify({ newRole: role })]
    );

    res.json({
      success: true,
      message: '用户角色更新成功'
    });
  } catch (error) {
    console.error('更新用户角色错误:', error);
    res.status(500).json({
      success: false,
      message: '更新用户角色失败'
    });
  }
};

// 禁用/启用用户（管理员）
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // 不能禁用自己
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: '不能禁用自己'
      });
    }

    await query(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [isActive, id]
    );

    // 记录管理员操作
    await query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, isActive ? 'ENABLE_USER' : 'DISABLE_USER', 'user', id, JSON.stringify({ isActive })]
    );

    res.json({
      success: true,
      message: isActive ? '用户已启用' : '用户已禁用'
    });
  } catch (error) {
    console.error('切换用户状态错误:', error);
    res.status(500).json({
      success: false,
      message: '操作失败'
    });
  }
};

// 删除用户（管理员）
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // 不能删除自己
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: '不能删除自己'
      });
    }

    await transaction(async (connection) => {
      // 删除用户相关的所有数据
      await connection.execute('DELETE FROM learning_records WHERE user_id = ?', [id]);
      await connection.execute('DELETE FROM translation_records WHERE user_id = ?', [id]);
      await connection.execute('DELETE FROM likes WHERE user_id = ?', [id]);
      await connection.execute('DELETE FROM comments WHERE user_id = ?', [id]);
      await connection.execute('DELETE FROM posts WHERE author_id = ?', [id]);
      await connection.execute('DELETE FROM users WHERE id = ?', [id]);
    });

    // 记录管理员操作
    await query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'DELETE_USER', 'user', id, JSON.stringify({})]
    );

    res.json({
      success: true,
      message: '用户已删除'
    });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({
      success: false,
      message: '删除用户失败'
    });
  }
};

// 获取所有帖子（管理员）
export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const author = req.query.author || '';
    const date = req.query.date || '';
    const safePage = isNaN(page) ? 1 : page;
    const safeLimit = isNaN(limit) ? 20 : limit;
    const offset = Math.max(0, (safePage - 1) * safeLimit);

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (p.title LIKE ? OR p.content LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    if (category) {
      whereClause += ' AND p.category = ?';
      params.push(category);
    }

    if (author) {
      whereClause += ' AND u.username LIKE ?';
      params.push(`%${author}%`);
    }

    if (date) {
      whereClause += ' AND DATE(p.created_at) = ?';
      params.push(date);
    }

    const posts = await query(
      `SELECT p.*, u.username as author_username, u.avatar as author_avatar,
              (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = false) as comment_count
       FROM posts p
       JOIN users u ON p.author_id = u.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM posts p ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / safeLimit)
        }
      }
    });
  } catch (error) {
    console.error('获取帖子列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取帖子列表失败'
    });
  }
};

// 删除帖子（管理员）
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    await query(
      'UPDATE posts SET is_deleted = true WHERE id = ?',
      [id]
    );

    // 记录管理员操作
    await query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'DELETE_POST', 'post', id, JSON.stringify({})]
    );

    res.json({
      success: true,
      message: '帖子已删除'
    });
  } catch (error) {
    console.error('删除帖子错误:', error);
    res.status(500).json({
      success: false,
      message: '删除帖子失败'
    });
  }
};

// 获取所有评论（管理员）
export const getAllComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const safePage = isNaN(page) ? 1 : page;
    const safeLimit = isNaN(limit) ? 20 : limit;
    const offset = Math.max(0, (safePage - 1) * safeLimit);

    let whereClause = 'WHERE c.is_deleted = false';
    const params = [];

    if (search) {
      whereClause += ' AND c.content LIKE ?';
      params.push(`%${search}%`);
    }

    const comments = await query(
      `SELECT c.*, u.username as user_username, p.title as post_title
       FROM comments c
       JOIN users u ON c.user_id = u.id
       JOIN posts p ON c.post_id = p.id
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM comments c ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / safeLimit)
        }
      }
    });
  } catch (error) {
    console.error('获取评论列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取评论列表失败'
    });
  }
};

// 删除评论（管理员）
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    await query(
      'UPDATE comments SET is_deleted = true WHERE id = ?',
      [id]
    );

    // 记录管理员操作
    await query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'DELETE_COMMENT', 'comment', id, JSON.stringify({})]
    );

    res.json({
      success: true,
      message: '评论已删除'
    });
  } catch (error) {
    console.error('删除评论错误:', error);
    res.status(500).json({
      success: false,
      message: '删除评论失败'
    });
  }
};

// 获取系统统计信息（管理员）
export const getSystemStats = async (req, res) => {
  try {
    // 用户统计
    const userStats = await query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
        SUM(CASE WHEN role = 'moderator' THEN 1 ELSE 0 END) as moderator_count,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as user_count,
        SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_users_today
      FROM users
    `);

    // 帖子统计
    const postStats = await query(`
      SELECT 
        COUNT(*) as total_posts,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_posts_today
      FROM posts
      WHERE is_deleted = false
    `);

    // 评论统计
    const commentStats = await query(`
      SELECT 
        COUNT(*) as total_comments,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_comments_today
      FROM comments
      WHERE is_deleted = false
    `);

    // 学习记录统计
    const learningStats = await query(`
      SELECT 
        COUNT(*) as total_learning_records,
        SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed_lessons
      FROM learning_records
    `);

    // 翻译记录统计
    const translationStats = await query(`
      SELECT 
        COUNT(*) as total_translations,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as translations_today
      FROM translation_records
    `);

    res.json({
      success: true,
      data: {
        users: userStats[0],
        posts: postStats[0],
        comments: commentStats[0],
        learning: learningStats[0],
        translations: translationStats[0]
      }
    });
  } catch (error) {
    console.error('获取系统统计错误:', error);
    res.status(500).json({
      success: false,
      message: '获取系统统计失败'
    });
  }
};

// 获取管理员操作日志
export const getAdminLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const safePage = isNaN(page) ? 1 : page;
    const safeLimit = isNaN(limit) ? 50 : limit;
    const offset = Math.max(0, (safePage - 1) * safeLimit);

    const logs = await query(
      `SELECT al.*, u.username as admin_username
       FROM admin_logs al
       JOIN users u ON al.admin_id = u.id
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [safeLimit, offset]
    );

    const countResult = await query('SELECT COUNT(*) as total FROM admin_logs');

    res.json({
      success: true,
      data: {
        logs: logs.map(log => {
          let details = null;
          try {
            if (log.details) {
              // 检查details是否已经是对象
              if (typeof log.details === 'string') {
                details = JSON.parse(log.details);
              } else {
                details = log.details;
              }
            }
          } catch (error) {
            console.error('解析日志详情失败:', error);
            details = null;
          }
          return {
            ...log,
            details
          };
        }),
        pagination: {
          page: safePage,
          limit: safeLimit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / safeLimit)
        }
      }
    });
  } catch (error) {
    console.error('获取管理员日志错误:', error);
    res.status(500).json({
      success: false,
      message: '获取管理员日志失败'
    });
  }
};

// 获取所有社群（管理员）
export const getAllGroups = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const safePage = isNaN(page) ? 1 : page;
    const safeLimit = isNaN(limit) ? 20 : limit;
    const offset = Math.max(0, (safePage - 1) * safeLimit);

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND g.name LIKE ?';
      params.push(`%${search}%`);
    }

    const groups = await query(
      `SELECT g.*, u.username as creator_username,
              (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
       FROM groups_table g
       JOIN users u ON g.creator_id = u.id
       ${whereClause}
       ORDER BY g.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM groups_table g ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: {
        groups,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / safeLimit)
        }
      }
    });
  } catch (error) {
    console.error('获取社群列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取社群列表失败'
    });
  }
};

// 获取社群详情（管理员）
export const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await query(
      `SELECT g.*, u.username as creator_username
       FROM groups_table g
       JOIN users u ON g.creator_id = u.id
       WHERE g.id = ?`,
      [id]
    );

    if (group.length === 0) {
      return res.status(404).json({
        success: false,
        message: '社群不存在'
      });
    }

    const members = await query(
      `SELECT gm.*, u.username as user_username, u.avatar as user_avatar
       FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = ?
       ORDER BY gm.role DESC, gm.joined_at ASC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        group: group[0],
        members
      }
    });
  } catch (error) {
    console.error('获取社群详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取社群详情失败'
    });
  }
};

// 删除社群（管理员）
export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    // 检查社群是否存在
    const group = await query(
      'SELECT id FROM groups_table WHERE id = ?',
      [id]
    );

    if (group.length === 0) {
      return res.status(404).json({
        success: false,
        message: '社群不存在'
      });
    }

    // 开始事务
    await transaction(async (connection) => {
      // 删除群组成员
      await connection.query(
        'DELETE FROM group_members WHERE group_id = ?',
        [id]
      );

      // 删除群组消息
      await connection.query(
        'DELETE FROM group_messages WHERE group_id = ?',
        [id]
      );

      // 删除群组
      await connection.query(
        'DELETE FROM groups_table WHERE id = ?',
        [id]
      );
    });

    res.json({
      success: true,
      message: '社群删除成功'
    });
  } catch (error) {
    console.error('删除社群错误:', error);
    res.status(500).json({
      success: false,
      message: '删除社群失败'
    });
  }
};

// 获取帖子详情（管理员）
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await query(
      `SELECT p.*, u.username as author_username, u.avatar as author_avatar
       FROM posts p
       JOIN users u ON p.author_id = u.id
       WHERE p.id = ?`,
      [id]
    );

    if (post.length === 0) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    // 获取评论
    const comments = await query(
      `SELECT c.*, u.username as user_username, u.avatar as user_avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ? AND c.parent_id IS NULL AND c.is_deleted = false
       ORDER BY c.created_at ASC`,
      [id]
    );

    // 获取二级评论
    for (const comment of comments) {
      const replies = await query(
        `SELECT c.*, u.username as user_username, u.avatar as user_avatar
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.parent_id = ? AND c.is_deleted = false
         ORDER BY c.created_at ASC`,
        [comment.id]
      );
      comment.replies = replies;
    }

    res.json({
      success: true,
      data: {
        post: post[0],
        comments
      }
    });
  } catch (error) {
    console.error('获取帖子详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取帖子详情失败'
    });
  }
};

// 获取群聊消息（管理员）
export const getGroupMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const safePage = isNaN(page) ? 1 : page;
    const safeLimit = isNaN(limit) ? 50 : limit;
    const offset = Math.max(0, (safePage - 1) * safeLimit);

    // 检查社群是否存在
    const group = await query(
      'SELECT id FROM groups_table WHERE id = ?',
      [id]
    );

    if (group.length === 0) {
      return res.status(404).json({
        success: false,
        message: '社群不存在'
      });
    }

    // 获取群聊消息
    const messages = await query(
      `SELECT gm.*, u.username as user_username, u.avatar as user_avatar
       FROM group_messages gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = ?
       ORDER BY gm.created_at DESC
       LIMIT ? OFFSET ?`,
      [id, safeLimit, offset]
    );

    // 获取消息总数
    const countResult = await query(
      'SELECT COUNT(*) as total FROM group_messages WHERE group_id = ?',
      [id]
    );

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // 反转顺序，使最早的消息在前面
        pagination: {
          page: safePage,
          limit: safeLimit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / safeLimit)
        }
      }
    });
  } catch (error) {
    console.error('获取群聊消息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取群聊消息失败'
    });
  }
};

// 移出群成员（管理员）
export const removeGroupMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    // 检查成员是否在群里
    const member = await query(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );

    if (member.length === 0) {
      return res.status(404).json({
        success: false,
        message: '成员不在群里'
      });
    }

    await query(
      'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );

    res.json({
      success: true,
      message: '成员已移出'
    });
  } catch (error) {
    console.error('移出群成员错误:', error);
    res.status(500).json({
      success: false,
      message: '移出群成员失败'
    });
  }
};

// 删除群消息（管理员）
export const deleteGroupMessage = async (req, res) => {
  try {
    const { id } = req.params;

    // 检查消息是否存在
    const message = await query(
      'SELECT id FROM group_messages WHERE id = ?',
      [id]
    );

    if (message.length === 0) {
      return res.status(404).json({
        success: false,
        message: '消息不存在'
      });
    }

    await query(
      'UPDATE group_messages SET content = ? WHERE id = ?',
      ['该信息被删除', id]
    );

    res.json({
      success: true,
      message: '消息已删除'
    });
  } catch (error) {
    console.error('删除群消息错误:', error);
    res.status(500).json({
      success: false,
      message: '删除群消息失败'
    });
  }
};

// 新增用户（管理员）
export const createUser = async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    // 检查用户名是否已存在
    const existingUser = await query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: '用户名或邮箱已存在'
      });
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建用户
    await query(
      'INSERT INTO users (username, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role, true]
    );

    res.json({
      success: true,
      message: '用户创建成功'
    });
  } catch (error) {
    console.error('创建用户错误:', error);
    res.status(500).json({
      success: false,
      message: '创建用户失败'
    });
  }
};
