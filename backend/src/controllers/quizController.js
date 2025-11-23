import SignLetter from '../models/SignLetter.js';
import { getNeo4jSession } from '../config/neo4j.js';
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

// Neo4j 连接健康检查
const checkDatabaseConnection = async () => {
  const session = getNeo4jSession();
  try {
    await session.run('RETURN 1 AS ok');
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    return false;
  } finally {
    await session.close();
  }
};

// 获取随机手语字母测验题目
export const getRandomQuiz = async (req, res) => {
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
    
    // 获取随机字母（Neo4j）
    const session = getNeo4jSession();
    const result = await session.run('MATCH (l:SignLetter) RETURN l ORDER BY rand() LIMIT 1');
    await session.close();

    if (result.records.length === 0) {
      return res.status(404).json({
        success: false,
        message: '没有找到测验数据',
        error: 'No quiz data available'
      });
    }
    const currentLetter = new SignLetter(result.records[0].get('l').properties);
    
    // 获取两个随机错误选项
    const wrongOptions = await SignLetter.getRandomLetters(currentLetter.letter, 2);
    
    // 生成选项数组
    const options = [
      currentLetter.letter,
      ...wrongOptions.map(letter => letter.letter)
    ];
    
    // 随机打乱选项顺序
    const shuffledOptions = options.sort(() => Math.random() - 0.5);
    
    // 记录请求日志（可选）
    console.log(`生成手语字母测验: ${currentLetter.letter} (ID: ${currentLetter.id}), 时间: ${new Date().toISOString()}`);
    
    res.status(200).json({
      success: true,
      data: {
        id: currentLetter.id,
        letter: currentLetter.letter,
        image_path: currentLetter.image_path,
        explanation_path: currentLetter.explanation_path,
        options: shuffledOptions,
        correct_answer: currentLetter.letter
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

// 提交测验答案
export const submitQuizAnswer = async (req, res) => {
  try {
    // 验证请求体
    const { letterId, selectedAnswer } = req.body;
    
    if (!letterId || !selectedAnswer) {
      return res.status(400).json({
        success: false,
        message: '请提供完整的答案信息',
        error: 'Missing required fields'
      });
    }
    
    // 获取正确答案
    const letter = await SignLetter.getById(letterId);
    if (!letter) {
      return res.status(404).json({
        success: false,
        message: '手语字母不存在',
        error: 'Letter not found'
      });
    }
    
    const isCorrect = selectedAnswer === letter.letter;
    
    res.status(200).json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: letter.letter,
        explanationPath: letter.explanation_path
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