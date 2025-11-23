import { db } from '../config/mysql.js';
import rateLimit from 'express-rate-limit';

// 创建请求频率限制中间件
export const quizRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1分钟窗口期
  max: 20, // 每个IP每窗口期最多20次请求
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试',
    error: 'Too many requests'
  }
});

// 验证数据库连接
const checkDatabaseConnection = async () => {
  try {
    await db.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    return false;
  }
};

// 手语手势示例数据（实际应用中应从数据库获取）
const fingerSigns = [
  {
    id: 1,
    sign: '你好',
    image_path: '/images/finger_signs/hello.png',
    explanation_path: '/images/finger_signs_explanation/hello_exp.png',
    options: ['你好', '再见', '谢谢'],
    correct_answer: '你好'
  },
  {
    id: 2,
    sign: '再见',
    image_path: '/images/finger_signs/goodbye.png',
    explanation_path: '/images/finger_signs_explanation/goodbye_exp.png',
    options: ['再见', '你好', '请'],
    correct_answer: '再见'
  },
  {
    id: 3,
    sign: '谢谢',
    image_path: '/images/finger_signs/thank_you.png',
    explanation_path: '/images/finger_signs_explanation/thank_you_exp.png',
    options: ['谢谢', '请', '对不起'],
    correct_answer: '谢谢'
  },
  {
    id: 4,
    sign: '请',
    image_path: '/images/finger_signs/please.png',
    explanation_path: '/images/finger_signs_explanation/please_exp.png',
    options: ['请', '谢谢', '对不起'],
    correct_answer: '请'
  },
  {
    id: 5,
    sign: '对不起',
    image_path: '/images/finger_signs/sorry.png',
    explanation_path: '/images/finger_signs_explanation/sorry_exp.png',
    options: ['对不起', '请', '不客气'],
    correct_answer: '对不起'
  }
];

// 获取随机手指语测验题目
export const getRandomFingerSignQuiz = async (req, res) => {
  try {
    // 验证数据库连接状态
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        message: '数据库服务不可用，请稍后再试',
        error: 'Database connection failed'
      });
    }
    
    // 从示例数据中随机选择一题
    // 实际应用中应从数据库中查询
    const randomIndex = Math.floor(Math.random() * fingerSigns.length);
    const currentQuestion = fingerSigns[randomIndex];
    
    // 处理无数据情况
    if (!currentQuestion) {
      return res.status(404).json({
        success: false,
        message: '没有找到测验数据',
        error: 'No quiz data available'
      });
    }
    
    // 随机打乱选项顺序
    const shuffledOptions = [...currentQuestion.options].sort(() => Math.random() - 0.5);
    
    // 返回随机题目
    res.status(200).json({
      success: true,
      data: {
        ...currentQuestion,
        options: shuffledOptions
      },
      message: '获取测验题目成功'
    });
  } catch (error) {
    console.error('获取测验题目失败:', error);
    res.status(500).json({
      success: false,
      message: '获取测验题目失败',
      error: error.message
    });
  }
};

// 提交手指语测验答案
export const submitFingerSignAnswer = async (req, res) => {
  try {
    // 验证请求体
    const { signId, selectedAnswer } = req.body;
    
    if (!signId || !selectedAnswer) {
      return res.status(400).json({
        success: false,
        message: '请提供完整的答案信息',
        error: 'Missing required fields'
      });
    }
    
    // 查找对应的题目（实际应用中应从数据库查询）
    const sign = fingerSigns.find(s => s.id === parseInt(signId));
    
    if (!sign) {
      return res.status(404).json({
        success: false,
        message: '手指语题目不存在',
        error: 'Sign not found'
      });
    }
    
    const isCorrect = selectedAnswer === sign.correct_answer;
    
    // 返回结果
    res.status(200).json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: sign.correct_answer,
        explanationPath: sign.explanation_path
      },
      message: isCorrect ? '答案正确！' : '答案错误，请继续学习'
    });
  } catch (error) {
    console.error('提交测验答案失败:', error);
    res.status(500).json({
      success: false,
      message: '提交测验答案失败',
      error: error.message
    });
  }
};
