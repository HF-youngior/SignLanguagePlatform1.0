import express from 'express';
import {
  getRandomFingerSignQuiz,
  submitFingerSignAnswer,
  quizRateLimit
} from '../controllers/fingerSignController.js';

const router = express.Router();

// 获取随机手指语测验题目 - 应用请求频率限制
router.get('/finger-signs/quiz', quizRateLimit, getRandomFingerSignQuiz);

// 提交手指语测验答案
router.post('/finger-signs/answer', quizRateLimit, submitFingerSignAnswer);

export default router;
