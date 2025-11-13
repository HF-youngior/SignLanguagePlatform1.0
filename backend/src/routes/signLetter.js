import express from 'express';
import {
  getAllSignLetters,
  getSignLetterById,
  generateLearningQuestion,
  submitAnswer,
  getLearningProgress,
  getNextLetter
} from '../controllers/signLetterController.js';

const router = express.Router();

// 获取所有手语字母
router.get('/letters', getAllSignLetters);

// 获取单个手语字母
router.get('/letters/:id', getSignLetterById);

// 生成学习题目
router.get('/question', generateLearningQuestion);

// 提交学习答案
router.post('/answer', submitAnswer);

// 获取学习进度
router.get('/progress', getLearningProgress);

// 获取下一个学习字母
router.get('/next', getNextLetter);

export default router;

