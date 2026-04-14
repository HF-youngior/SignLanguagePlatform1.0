import { query, transaction } from '../config/mysql.js';
import bcrypt from 'bcryptjs';

const clampInt = (value, fallback, min, max) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

const normalizeDateTimeParam = (input, endOfDay = false) => {
  if (!input) return null;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    if (endOfDay) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }
  }

  const pad = (num) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const toDateKey = (date) => {
  const pad = (num) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const buildDateSeries = (days) => {
  const result = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    result.push(toDateKey(d));
  }
  return result;
};

const parseLogDetails = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const toNumber = (value) => Number(value || 0);

export const getAllUsers = async (req, res) => {
  try {
    const page = clampInt(req.query.page, 1, 1, 100000);
    const limit = clampInt(req.query.limit, 20, 1, 200);
    const search = (req.query.search || '').trim();
    const role = (req.query.role || '').trim();
    const offset = Math.max(0, (page - 1) * limit);

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern, pattern);
    }

    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    const users = await query(
      `SELECT id, username, email, first_name, last_name, role, avatar, is_active, created_at, last_login
       FROM users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) AS total FROM users ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
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

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const users = await query(
      `SELECT id, username, email, first_name, last_name, role, avatar, bio, is_active, created_at, last_login
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

    const [learningRecords, translationRecords, postCount, commentCount] = await Promise.all([
      query(`SELECT * FROM learning_records WHERE user_id = ? ORDER BY created_at DESC`, [id]),
      query(`SELECT * FROM translation_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`, [id]),
      query(`SELECT COUNT(*) AS count FROM posts WHERE author_id = ? AND is_deleted = false`, [id]),
      query(`SELECT COUNT(*) AS count FROM comments WHERE user_id = ? AND is_deleted = false`, [id])
    ]);

    res.json({
      success: true,
      data: {
        user,
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

    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: '不能修改自己的角色'
      });
    }

    await query('UPDATE users SET role = ? WHERE id = ?', [role, id]);

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

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: '不能禁用自己'
      });
    }

    await query('UPDATE users SET is_active = ? WHERE id = ?', [Boolean(isActive), id]);

    await query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, isActive ? 'ENABLE_USER' : 'DISABLE_USER', 'user', id, JSON.stringify({ isActive: Boolean(isActive) })]
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

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: '不能删除自己'
      });
    }

    await transaction(async (connection) => {
      await connection.query('DELETE FROM group_members WHERE user_id = ?', [id]);
      await connection.query('DELETE FROM group_messages WHERE user_id = ?', [id]);
      await connection.query('DELETE FROM learning_records WHERE user_id = ?', [id]);
      await connection.query('DELETE FROM translation_records WHERE user_id = ?', [id]);
      await connection.query('DELETE FROM likes WHERE user_id = ?', [id]);
      await connection.query('DELETE FROM comments WHERE user_id = ?', [id]);
      await connection.query('DELETE FROM posts WHERE author_id = ?', [id]);
      await connection.query('DELETE FROM users WHERE id = ?', [id]);
    });

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

export const getAllPosts = async (req, res) => {
  try {
    const page = clampInt(req.query.page, 1, 1, 100000);
    const limit = clampInt(req.query.limit, 20, 1, 200);
    const search = (req.query.search || '').trim();
    const category = (req.query.category || '').trim();
    const author = (req.query.author || '').trim();
    const date = (req.query.date || '').trim();
    const offset = Math.max(0, (page - 1) * limit);

    let whereClause = 'WHERE p.is_deleted = false';
    const params = [];

    if (search) {
      whereClause += ' AND (p.title LIKE ? OR p.content LIKE ?)';
      const pattern = `%${search}%`;
      params.push(pattern, pattern);
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
      `SELECT p.*, u.username AS author_username, u.avatar AS author_avatar,
              (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = false) AS comment_count
       FROM posts p
       JOIN users u ON p.author_id = u.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) AS total
       FROM posts p
       JOIN users u ON p.author_id = u.id
       ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
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

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    await query('UPDATE posts SET is_deleted = true WHERE id = ?', [id]);

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

export const getAllComments = async (req, res) => {
  try {
    const page = clampInt(req.query.page, 1, 1, 100000);
    const limit = clampInt(req.query.limit, 20, 1, 200);
    const search = (req.query.search || '').trim();
    const offset = Math.max(0, (page - 1) * limit);

    let whereClause = 'WHERE c.is_deleted = false';
    const params = [];

    if (search) {
      whereClause += ' AND c.content LIKE ?';
      params.push(`%${search}%`);
    }

    const comments = await query(
      `SELECT c.*, u.username AS user_username, p.title AS post_title
       FROM comments c
       JOIN users u ON c.user_id = u.id
       JOIN posts p ON c.post_id = p.id
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) AS total FROM comments c ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
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

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    await query('UPDATE comments SET is_deleted = true WHERE id = ?', [id]);

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

export const getSystemStats = async (req, res) => {
  try {
    const [userStats, postStats, commentStats, learningStats, translationStats] = await Promise.all([
      query(`
        SELECT
          COUNT(*) as total_users,
          SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
          SUM(CASE WHEN role = 'moderator' THEN 1 ELSE 0 END) as moderator_count,
          SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as user_count,
          SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_users,
          SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_users_today
        FROM users
      `),
      query(`
        SELECT
          COUNT(*) as total_posts,
          SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_posts_today
        FROM posts
        WHERE is_deleted = false
      `),
      query(`
        SELECT
          COUNT(*) as total_comments,
          SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_comments_today
        FROM comments
        WHERE is_deleted = false
      `),
      query(`
        SELECT
          COUNT(*) as total_learning_records,
          SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed_lessons
        FROM learning_records
      `),
      query(`
        SELECT
          COUNT(*) as total_translations,
          SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as translations_today
        FROM translation_records
      `)
    ]);

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

export const getAdminDashboard = async (req, res) => {
  try {
    const days = clampInt(req.query.days, 7, 3, 30);
    const daysBack = days - 1;

    const [
      kpiRows,
      todayRows,
      userTrendRows,
      postTrendRows,
      commentTrendRows,
      adminOpsRows,
      recentLogsRows,
      topUsersRows,
      topPostsRows,
      groupActivityRows
    ] = await Promise.all([
      query(`
        SELECT
          (SELECT COUNT(*) FROM users) AS total_users,
          (SELECT COUNT(*) FROM users WHERE is_active = true) AS active_users,
          (SELECT COUNT(*) FROM posts WHERE is_deleted = false) AS total_posts,
          (SELECT COUNT(*) FROM comments WHERE is_deleted = false) AS total_comments,
          (SELECT COUNT(*) FROM groups_table WHERE is_active = true) AS total_groups
      `),
      query(`
        SELECT
          (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()) AS new_users_today,
          (SELECT COUNT(*) FROM posts WHERE is_deleted = false AND DATE(created_at) = CURDATE()) AS new_posts_today,
          (SELECT COUNT(*) FROM comments WHERE is_deleted = false AND DATE(created_at) = CURDATE()) AS new_comments_today
      `),
      query(`
        SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day_key, COUNT(*) AS count
        FROM users
        WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
      `, [daysBack]),
      query(`
        SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day_key, COUNT(*) AS count
        FROM posts
        WHERE is_deleted = false
          AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
      `, [daysBack]),
      query(`
        SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day_key, COUNT(*) AS count
        FROM comments
        WHERE is_deleted = false
          AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
      `, [daysBack]),
      query(`
        SELECT COUNT(*) AS total
        FROM admin_logs
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      `, [days]),
      query(`
        SELECT al.*, u.username AS admin_username
        FROM admin_logs al
        JOIN users u ON al.admin_id = u.id
        ORDER BY al.created_at DESC
        LIMIT 20
      `),
      query(`
        SELECT
          u.id,
          u.username,
          u.avatar,
          COALESCE(p.post_count, 0) AS post_count,
          COALESCE(c.comment_count, 0) AS comment_count,
          COALESCE(gm.message_count, 0) AS message_count,
          (
            COALESCE(p.post_count, 0) * 3 +
            COALESCE(c.comment_count, 0) * 2 +
            COALESCE(gm.message_count, 0)
          ) AS activity_score
        FROM users u
        LEFT JOIN (
          SELECT author_id AS user_id, COUNT(*) AS post_count
          FROM posts
          WHERE is_deleted = false
            AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
          GROUP BY author_id
        ) p ON p.user_id = u.id
        LEFT JOIN (
          SELECT user_id, COUNT(*) AS comment_count
          FROM comments
          WHERE is_deleted = false
            AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
          GROUP BY user_id
        ) c ON c.user_id = u.id
        LEFT JOIN (
          SELECT user_id, COUNT(*) AS message_count
          FROM group_messages
          WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
          GROUP BY user_id
        ) gm ON gm.user_id = u.id
        WHERE u.is_active = true
        ORDER BY activity_score DESC, post_count DESC, comment_count DESC, u.id ASC
        LIMIT 8
      `, [daysBack, daysBack, daysBack]),
      query(`
        SELECT
          p.id,
          p.title,
          p.created_at,
          u.username AS author_username,
          COALESCE(c.comment_count, 0) AS comment_count,
          COALESCE(l.like_count, 0) AS like_count,
          (COALESCE(c.comment_count, 0) * 2 + COALESCE(l.like_count, 0)) AS engagement_score
        FROM posts p
        JOIN users u ON p.author_id = u.id
        LEFT JOIN (
          SELECT post_id, COUNT(*) AS comment_count
          FROM comments
          WHERE is_deleted = false
          GROUP BY post_id
        ) c ON c.post_id = p.id
        LEFT JOIN (
          SELECT target_id AS post_id, COUNT(*) AS like_count
          FROM likes
          WHERE target_type = 'post'
          GROUP BY target_id
        ) l ON l.post_id = p.id
        WHERE p.is_deleted = false
        ORDER BY engagement_score DESC, p.created_at DESC
        LIMIT 8
      `),
      query(`
        SELECT
          g.id,
          g.name,
          COALESCE(m.message_count, 0) AS message_count,
          COALESCE(mb.member_count, 0) AS member_count
        FROM groups_table g
        LEFT JOIN (
          SELECT group_id, COUNT(*) AS message_count
          FROM group_messages
          WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
          GROUP BY group_id
        ) m ON m.group_id = g.id
        LEFT JOIN (
          SELECT group_id, COUNT(*) AS member_count
          FROM group_members
          GROUP BY group_id
        ) mb ON mb.group_id = g.id
        WHERE g.is_active = true
        ORDER BY message_count DESC, member_count DESC, g.created_at DESC
        LIMIT 8
      `, [daysBack])
    ]);

    const dateKeys = buildDateSeries(days);
    const userMap = new Map(userTrendRows.map(row => [row.day_key, toNumber(row.count)]));
    const postMap = new Map(postTrendRows.map(row => [row.day_key, toNumber(row.count)]));
    const commentMap = new Map(commentTrendRows.map(row => [row.day_key, toNumber(row.count)]));

    res.json({
      success: true,
      data: {
        rangeDays: days,
        generatedAt: new Date().toISOString(),
        kpis: {
          totalUsers: toNumber(kpiRows[0]?.total_users),
          activeUsers: toNumber(kpiRows[0]?.active_users),
          totalPosts: toNumber(kpiRows[0]?.total_posts),
          totalComments: toNumber(kpiRows[0]?.total_comments),
          totalGroups: toNumber(kpiRows[0]?.total_groups)
        },
        today: {
          newUsers: toNumber(todayRows[0]?.new_users_today),
          newPosts: toNumber(todayRows[0]?.new_posts_today),
          newComments: toNumber(todayRows[0]?.new_comments_today)
        },
        trend: {
          dates: dateKeys,
          newUsers: dateKeys.map(key => userMap.get(key) || 0),
          newPosts: dateKeys.map(key => postMap.get(key) || 0),
          newComments: dateKeys.map(key => commentMap.get(key) || 0)
        },
        operations: {
          lastDays: days,
          totalInRange: toNumber(adminOpsRows[0]?.total),
          recent: recentLogsRows.map(log => ({
            ...log,
            details: parseLogDetails(log.details)
          }))
        },
        topUsers: topUsersRows.map(row => ({
          id: row.id,
          username: row.username,
          avatar: row.avatar,
          postCount: toNumber(row.post_count),
          commentCount: toNumber(row.comment_count),
          messageCount: toNumber(row.message_count),
          activityScore: toNumber(row.activity_score)
        })),
        topPosts: topPostsRows.map(row => ({
          id: row.id,
          title: row.title,
          createdAt: row.created_at,
          authorUsername: row.author_username,
          commentCount: toNumber(row.comment_count),
          likeCount: toNumber(row.like_count),
          engagementScore: toNumber(row.engagement_score)
        })),
        groupActivity: groupActivityRows.map(row => ({
          id: row.id,
          name: row.name,
          messageCount: toNumber(row.message_count),
          memberCount: toNumber(row.member_count)
        }))
      }
    });
  } catch (error) {
    console.error('获取管理员看板数据错误:', error);
    res.status(500).json({
      success: false,
      message: '获取管理员看板数据失败'
    });
  }
};

export const getAdminLogs = async (req, res) => {
  try {
    const page = clampInt(req.query.page, 1, 1, 100000);
    const limit = clampInt(req.query.limit, 50, 1, 200);
    const action = (req.query.action || '').trim();
    const keyword = (req.query.keyword || '').trim();
    const startDateRaw = (req.query.startDate || '').trim();
    const endDateRaw = (req.query.endDate || '').trim();
    const startDate = normalizeDateTimeParam(startDateRaw, false);
    const endDate = normalizeDateTimeParam(endDateRaw, true);

    if (startDateRaw && !startDate) {
      return res.status(400).json({ success: false, message: 'startDate 日期格式无效' });
    }

    if (endDateRaw && !endDate) {
      return res.status(400).json({ success: false, message: 'endDate 日期格式无效' });
    }

    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({ success: false, message: 'startDate 不能大于 endDate' });
    }

    const offset = Math.max(0, (page - 1) * limit);
    let whereClause = 'WHERE 1 = 1';
    const params = [];

    if (action) {
      whereClause += ' AND al.action = ?';
      params.push(action);
    }

    if (startDate) {
      whereClause += ' AND al.created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND al.created_at <= ?';
      params.push(endDate);
    }

    if (keyword) {
      const pattern = `%${keyword}%`;
      whereClause += ' AND (al.action LIKE ? OR al.target_type LIKE ? OR CAST(al.target_id AS CHAR) LIKE ? OR u.username LIKE ? OR CAST(al.details AS CHAR) LIKE ?)';
      params.push(pattern, pattern, pattern, pattern, pattern);
    }

    const logs = await query(
      `SELECT al.*, u.username AS admin_username
       FROM admin_logs al
       JOIN users u ON al.admin_id = u.id
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) AS total
       FROM admin_logs al
       JOIN users u ON al.admin_id = u.id
       ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: {
        logs: logs.map(log => ({
          ...log,
          details: parseLogDetails(log.details)
        })),
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        },
        filters: {
          action,
          keyword,
          startDate: startDateRaw || null,
          endDate: endDateRaw || null
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

export const getAllGroups = async (req, res) => {
  try {
    const page = clampInt(req.query.page, 1, 1, 100000);
    const limit = clampInt(req.query.limit, 20, 1, 200);
    const search = (req.query.search || '').trim();
    const keyword = (req.query.keyword || '').trim();
    const type = (req.query.type || '').trim();
    const category = (req.query.category || '').trim();
    const isActiveRaw = req.query.isActive;
    const startDateRaw = (req.query.startDate || '').trim();
    const endDateRaw = (req.query.endDate || '').trim();
    const startDate = normalizeDateTimeParam(startDateRaw, false);
    const endDate = normalizeDateTimeParam(endDateRaw, true);

    if (startDateRaw && !startDate) {
      return res.status(400).json({ success: false, message: 'startDate 日期格式无效' });
    }

    if (endDateRaw && !endDate) {
      return res.status(400).json({ success: false, message: 'endDate 日期格式无效' });
    }

    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({ success: false, message: 'startDate 不能大于 endDate' });
    }

    const offset = Math.max(0, (page - 1) * limit);
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search || keyword) {
      const pattern = `%${search || keyword}%`;
      whereClause += ' AND (g.name LIKE ? OR g.description LIKE ? OR u.username LIKE ?)';
      params.push(pattern, pattern, pattern);
    }

    if (type) {
      whereClause += ' AND g.type = ?';
      params.push(type);
    }

    if (category) {
      whereClause += ' AND g.category = ?';
      params.push(category);
    }

    if (typeof isActiveRaw !== 'undefined' && isActiveRaw !== '') {
      const normalized = String(isActiveRaw).toLowerCase();
      if (!['true', 'false', '1', '0'].includes(normalized)) {
        return res.status(400).json({
          success: false,
          message: 'isActive 只支持 true/false/1/0'
        });
      }
      whereClause += ' AND g.is_active = ?';
      params.push(normalized === 'true' || normalized === '1');
    }

    if (startDate) {
      whereClause += ' AND g.created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND g.created_at <= ?';
      params.push(endDate);
    }

    const groups = await query(
      `SELECT g.*, u.username AS creator_username,
              (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS member_count,
              (SELECT COUNT(*) FROM group_messages WHERE group_id = g.id) AS message_count
       FROM groups_table g
       JOIN users u ON g.creator_id = u.id
       ${whereClause}
       ORDER BY g.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) AS total
       FROM groups_table g
       JOIN users u ON g.creator_id = u.id
       ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: {
        groups,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        },
        filters: {
          search,
          keyword,
          type: type || null,
          category: category || null,
          isActive: typeof isActiveRaw === 'undefined' || isActiveRaw === '' ? null : isActiveRaw,
          startDate: startDateRaw || null,
          endDate: endDateRaw || null
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

export const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await query(
      `SELECT g.*, u.username AS creator_username
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
      `SELECT gm.*, u.username AS user_username, u.avatar AS user_avatar
       FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = ?
       ORDER BY FIELD(gm.role, 'owner', 'admin', 'moderator', 'member'), gm.joined_at ASC`,
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

export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await query('SELECT id FROM groups_table WHERE id = ?', [id]);
    if (group.length === 0) {
      return res.status(404).json({
        success: false,
        message: '社群不存在'
      });
    }

    await transaction(async (connection) => {
      await connection.query('DELETE FROM group_members WHERE group_id = ?', [id]);
      await connection.query('DELETE FROM group_messages WHERE group_id = ?', [id]);
      await connection.query('DELETE FROM group_posts WHERE group_id = ?', [id]);
      await connection.query('DELETE FROM group_invitations WHERE group_id = ?', [id]);
      await connection.query('DELETE FROM groups_table WHERE id = ?', [id]);
    });

    await query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'DELETE_GROUP', 'group', id, JSON.stringify({})]
    );

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

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await query(
      `SELECT p.*, u.username AS author_username, u.avatar AS author_avatar
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

    const comments = await query(
      `SELECT c.*, u.username AS user_username, u.avatar AS user_avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ? AND c.parent_id IS NULL AND c.is_deleted = false
       ORDER BY c.created_at ASC`,
      [id]
    );

    for (const comment of comments) {
      const replies = await query(
        `SELECT c.*, u.username AS user_username, u.avatar AS user_avatar
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

export const getGroupMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const page = clampInt(req.query.page, 1, 1, 100000);
    const limit = clampInt(req.query.limit, 50, 1, 200);
    const offset = Math.max(0, (page - 1) * limit);

    const group = await query('SELECT id FROM groups_table WHERE id = ?', [id]);
    if (group.length === 0) {
      return res.status(404).json({
        success: false,
        message: '社群不存在'
      });
    }

    const messages = await query(
      `SELECT gm.*, u.username AS user_username, u.avatar AS user_avatar
       FROM group_messages gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = ?
       ORDER BY gm.created_at DESC
       LIMIT ? OFFSET ?`,
      [id, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) AS total FROM group_messages WHERE group_id = ?',
      [id]
    );

    res.json({
      success: true,
      data: {
        messages: messages.reverse(),
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
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

export const removeGroupMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

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

    await query('DELETE FROM group_members WHERE group_id = ? AND user_id = ?', [groupId, userId]);
    await query('UPDATE groups_table SET member_count = GREATEST(member_count - 1, 0) WHERE id = ?', [groupId]);

    await query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'REMOVE_GROUP_MEMBER', 'group_member', groupId, JSON.stringify({ userId })]
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

export const deleteGroupMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await query('SELECT id, group_id FROM group_messages WHERE id = ?', [id]);
    if (message.length === 0) {
      return res.status(404).json({
        success: false,
        message: '消息不存在'
      });
    }

    await query('UPDATE group_messages SET content = ? WHERE id = ?', ['该消息已被管理员删除', id]);

    await query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'DELETE_GROUP_MESSAGE', 'group_message', id, JSON.stringify({ groupId: message[0].group_id })]
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

export const createUser = async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '请填写完整用户信息'
      });
    }

    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: '无效的角色类型'
      });
    }

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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await query(
      'INSERT INTO users (username, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role, true]
    );

    await query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'CREATE_USER', 'user', result.insertId, JSON.stringify({ username, role })]
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
