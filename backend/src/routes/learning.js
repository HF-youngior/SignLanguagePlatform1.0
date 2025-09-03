import express from 'express';
import { 
  getLessons, 
  getLessonById, 
  startLesson, 
  completeLesson,
  getProgress,
  getCategories,
  searchLessons
} from '../controllers/learningController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// 所有路由都需要身份验证
router.use(protect);

// 获取课程分类
router.get('/categories', getCategories);

// 获取课程列表
router.get('/lessons', getLessons);

// 搜索课程
router.get('/search', searchLessons);

// 获取特定课程
router.get('/lessons/:id', getLessonById);

// 开始学习课程
router.post('/lessons/:id/start', startLesson);

// 完成课程
router.post('/lessons/:id/complete', completeLesson);

// 获取学习进度
router.get('/progress', getProgress);

export default router;
