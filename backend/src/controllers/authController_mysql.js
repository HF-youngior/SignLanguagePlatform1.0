import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, transaction } from '../config/mysql.js';
import { validationResult } from 'express-validator';

// 生成JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Some managed MySQL instances may reject writes in maintenance/read-only windows.
// Failing to update last_login should not block a successful login.
const updateLastLoginSafely = async (userId) => {
  try {
    await query('UPDATE users SET last_login = NOW() WHERE id = ?', [userId]);
  } catch (error) {
    const isWriteBlocked = error?.code === 'ER_OPTION_PREVENTS_STATEMENT' || error?.errno === 1290;
    if (isWriteBlocked) {
      console.warn(`Skip last_login update for user ${userId}: ${error.message}`);
      return;
    }
    throw error;
  }
};

// 注册
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      });
    }

    const { username, email, password, firstName, lastName, avatar } = req.body;

    // 检查用户是否已存在
    const existingUser = await query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: '用户名或邮箱已被注册'
      });
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建用户
    const result = await query(
      `INSERT INTO users (username, email, password, first_name, last_name, avatar, role, is_active, is_email_verified)
       VALUES (?, ?, ?, ?, ?, ?, 'user', true, true)`,
      [username, email, hashedPassword, firstName || null, lastName || null, avatar || null]
    );

    const userId = result.insertId;
    const token = generateToken(userId);

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: userId,
          username,
          email,
          firstName: firstName || null,
          lastName: lastName || null,
          avatar: avatar || null,
          role: 'user'
        },
        token
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试'
    });
  }
};

// 登录
export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      });
    }

    const { username, password } = req.body;

    // 查找用户
    const users = await query(
      'SELECT id, username, email, password, first_name, last_name, role, avatar, bio, is_active, learning_progress FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const user = users[0];

    // 检查用户是否被禁用
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: '账号已被禁用，请联系管理员'
      });
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 更新最后登录时间
    await updateLastLoginSafely(user.id);

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          learningProgress: user.learning_progress ? JSON.parse(user.learning_progress) : null
        },
        token
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    });
  }
};

// 获取当前用户信息
export const getMe = async (req, res) => {
  try {
    const users = await query(
      'SELECT id, username, email, first_name, last_name, role, avatar, bio, learning_progress, preferences, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const user = users[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          learningProgress: user.learning_progress ? JSON.parse(user.learning_progress) : null,
          preferences: user.preferences ? JSON.parse(user.preferences) : null,
          createdAt: user.created_at
        }
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
};

// 更新用户信息
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio, avatar } = req.body;
    const userId = req.user.id;

    await query(
      'UPDATE users SET first_name = ?, last_name = ?, bio = ?, avatar = ? WHERE id = ?',
      [firstName || null, lastName || null, bio || null, avatar || null, userId]
    );

    res.json({
      success: true,
      message: '个人信息更新成功'
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '更新失败，请稍后重试'
    });
  }
};

// 修改密码
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // 获取用户当前密码
    const users = await query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 验证当前密码
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: '当前密码错误'
      });
    }

    // 加密新密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 更新密码
    await query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({
      success: false,
      message: '修改密码失败，请稍后重试'
    });
  }
};

// 刷新Token
export const refreshToken = async (req, res) => {
  try {
    const token = generateToken(req.user.id);
    
    res.json({
      success: true,
      data: { token }
    });
  } catch (error) {
    console.error('刷新Token错误:', error);
    res.status(500).json({
      success: false,
      message: '刷新Token失败'
    });
  }
};

// 登出
export const logout = async (req, res) => {
  // 在MySQL版本中，我们主要依赖JWT的过期时间
  // 如果需要实现Token黑名单，可以创建一个token_blacklist表
  res.json({
    success: true,
    message: '登出成功'
  });
};
