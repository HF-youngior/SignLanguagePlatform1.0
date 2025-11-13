import SignLetter from '../models/SignLetter.js';

// 获取所有手语字母
export const getAllSignLetters = async (req, res) => {
  try {
    const letters = await SignLetter.getAll();
    
    res.status(200).json({
      success: true,
      data: letters,
      message: '获取手语字母列表成功'
    });
  } catch (error) {
    console.error('获取手语字母列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取手语字母列表失败',
      error: error.message
    });
  }
};

// 获取单个手语字母
export const getSignLetterById = async (req, res) => {
  try {
    const { id } = req.params;
    const letter = await SignLetter.getById(id);
    
    if (!letter) {
      return res.status(404).json({
        success: false,
        message: '手语字母不存在'
      });
    }
    
    res.status(200).json({
      success: true,
      data: letter,
      message: '获取手语字母成功'
    });
  } catch (error) {
    console.error('获取手语字母失败:', error);
    res.status(500).json({
      success: false,
      message: '获取手语字母失败',
      error: error.message
    });
  }
};

// 生成学习题目（选择题）
export const generateLearningQuestion = async (req, res) => {
  try {
    const { currentId } = req.query;
    let letterId = currentId ? parseInt(currentId) : 1;
    
    // 获取当前字母
    const currentLetter = await SignLetter.getById(letterId);
    if (!currentLetter) {
      return res.status(404).json({
        success: false,
        message: '手语字母不存在'
      });
    }
    
    // 获取两个随机错误选项
    const wrongOptions = await SignLetter.getRandomLetters(currentLetter.letter, 2);
    
    // 生成选项数组
    const options = [
      currentLetter.letter,
      ...wrongOptions.map(letter => letter.letter)
    ];
    
    // 随机打乱选项顺序
    const shuffledOptions = options.sort(() => Math.random() - 0.5);
    
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
      message: '生成学习题目成功'
    });
  } catch (error) {
    console.error('生成学习题目失败:', error);
    res.status(500).json({
      success: false,
      message: '生成学习题目失败',
      error: error.message
    });
  }
};

// 提交学习答案
export const submitAnswer = async (req, res) => {
  try {
    const { letterId, selectedAnswer, userId } = req.body;
    
    // 获取正确答案
    const letter = await SignLetter.getById(letterId);
    if (!letter) {
      return res.status(404).json({
        success: false,
        message: '手语字母不存在'
      });
    }
    
    const isCorrect = selectedAnswer === letter.letter;
    
    // 如果答案正确，记录学习进度
    if (isCorrect) {
      await SignLetter.recordProgress(letterId, userId);
    }
    
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
    console.error('提交答案失败:', error);
    res.status(500).json({
      success: false,
      message: '提交答案失败',
      error: error.message
    });
  }
};

// 获取学习进度
export const getLearningProgress = async (req, res) => {
  try {
    const progress = await SignLetter.getLearningProgress();
    
    res.status(200).json({
      success: true,
      data: progress,
      message: '获取学习进度成功'
    });
  } catch (error) {
    console.error('获取学习进度失败:', error);
    res.status(500).json({
      success: false,
      message: '获取学习进度失败',
      error: error.message
    });
  }
};

// 获取下一个学习字母
export const getNextLetter = async (req, res) => {
  try {
    const { currentId } = req.query;
    const currentIdNum = currentId ? parseInt(currentId) : 0;
    const letter = await SignLetter.getNextByCurrentId(currentIdNum);
    if (!letter) {
      return res.status(200).json({
        success: true,
        data: null,
        message: '学习完成！'
      });
    }

    res.status(200).json({
      success: true,
      data: letter,
      message: '获取下一个字母成功'
    });
  } catch (error) {
    console.error('获取下一个字母失败:', error);
    res.status(500).json({
      success: false,
      message: '获取下一个字母失败',
      error: error.message
    });
  }
};

