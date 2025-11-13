import express from 'express';
import {
  getRandomQuiz,
  submitQuizAnswer,
  quizRateLimit
} from '../controllers/quizController.js';

const router = express.Router();

// 获取随机测验题目 - 应用请求频率限制
router.get('/sign-letters/quiz', quizRateLimit, getRandomQuiz);

// 提交测验答案
router.post('/sign-letters/quiz-answer', quizRateLimit, submitQuizAnswer);

export default router;