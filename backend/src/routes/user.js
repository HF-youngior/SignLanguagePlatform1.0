import express from 'express';
import { body } from 'express-validator';
import { 
  getProfile, 
  updateProfile, 
  changePassword, 
  deleteAccount,
  getUserStats,
  getUserProgress
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// 所有路由都需要身份验证
router.use(protect);

// 获取用户资料
router.get('/profile', getProfile);

// 更新用户资料
router.put('/profile', [
  body('username')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度必须在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('名字长度必须在1-50个字符之间'),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('姓氏长度必须在1-50个字符之间'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('个人简介不能超过500个字符')
], updateProfile);

// 修改密码
router.put('/change-password', [
  body('currentPassword')
    .notEmpty()
    .withMessage('当前密码不能为空'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('新密码长度至少6个字符')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('新密码必须包含至少一个小写字母、一个大写字母和一个数字'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('确认密码与新密码不匹配');
      }
      return true;
    })
], changePassword);

// 获取用户统计信息
router.get('/stats', getUserStats);

// 获取用户学习进度
router.get('/progress', getUserProgress);

// 删除账户
router.delete('/account', deleteAccount);

export default router;
