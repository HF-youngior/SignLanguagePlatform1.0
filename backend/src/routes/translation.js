import express from 'express';
import { 
  translateSignToText, 
  translateTextToSign,
  getTranslationHistory,
  saveTranslation,
  deleteTranslation
} from '../controllers/translationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// 所有路由都需要身份验证
router.use(protect);

// 手语转文字
router.post('/sign-to-text', translateSignToText);

// 文字转手语
router.post('/text-to-sign', translateTextToSign);

// 获取翻译历史
router.get('/history', getTranslationHistory);

// 保存翻译
router.post('/save', saveTranslation);

// 删除翻译记录
router.delete('/:id', deleteTranslation);

export default router;
