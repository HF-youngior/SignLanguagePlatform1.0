import express from 'express';
import { body } from 'express-validator';
import { 
  register, 
  login, 
  logout, 
  refreshToken, 
  getMe, 
  updateProfile, 
  changePassword 
} from '../controllers/authController_mysql.js';
import { protect } from '../middleware/auth_mysql.js';

const router = express.Router();

// 注册
router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度必须在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/)
    .withMessage('用户名只能包含字母、数字、下划线和中文'),
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少6个字符'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('确认密码与密码不匹配');
      }
      return true;
    })
], register);

// 登录
router.post('/login', [
  body('username')
    .notEmpty()
    .withMessage('用户名或邮箱不能为空'),
  body('password')
    .notEmpty()
    .withMessage('密码不能为空')
], login);

// 登出
router.post('/logout', protect, logout);

// 刷新令牌
router.post('/refresh', protect, refreshToken);

// 获取当前用户信息
router.get('/me', protect, getMe);

// 更新个人信息
router.put('/profile', protect, updateProfile);

// 修改密码
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('当前密码不能为空'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('新密码长度至少6个字符')
], changePassword);

export default router;