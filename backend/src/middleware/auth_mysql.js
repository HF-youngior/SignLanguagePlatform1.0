import jwt from 'jsonwebtoken';
import { query } from '../config/mysql.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // 从请求头获取token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 检查token是否存在
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '访问被拒绝，请提供有效的令牌'
      });
    }

    try {
      // 验证token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // 获取用户信息
      const users = await query(
        'SELECT id, username, email, role, is_active FROM users WHERE id = ?',
        [decoded.id]
      );
      
      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: '令牌无效，用户不存在'
        });
      }

      const user = users[0];

      // 检查用户是否被禁用
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: '账户已被禁用'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: '令牌无效或已过期'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '未授权访问'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      });
    }

    next();
  };
};

// 仅管理员可访问
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '未授权访问'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '权限不足，仅管理员可访问'
    });
  }

  next();
};

// 管理员或版主可访问
export const moderatorOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '未授权访问'
    });
  }

  if (!['admin', 'moderator'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: '权限不足'
    });
  }

  next();
};
