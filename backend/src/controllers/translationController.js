import Translation from '../models/Translation.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    手语转文字
// @route   POST /api/translation/sign-to-text
// @access  Private
export const translateSignToText = asyncHandler(async (req, res) => {
  const { type, detectedSigns, originalFile, resultFile, metadata, processingTime, confidence } = req.body;

  const translation = await Translation.create({
    user: req.user.id,
    type,
    detectedSigns,
    originalFile,
    resultFile,
    metadata,
    processingTime,
    confidence
  });

  res.status(201).json({
    success: true,
    data: translation
  });
});

// @desc    文字转手语
// @route   POST /api/translation/text-to-sign
// @access  Private
export const translateTextToSign = asyncHandler(async (req, res) => {
  const { sourceText } = req.body;

  // TODO: 实现文字到手语的转换逻辑
  res.status(200).json({
    success: true,
    data: {
      message: '文字到手语转换功能开发中...'
    }
  });
});

// @desc    获取翻译历史
// @route   GET /api/translation/history
// @access  Private
export const getTranslationHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type } = req.query;

  const query = { user: req.user.id };
  if (type) {
    query.type = type;
  }

  const translations = await Translation.find(query)
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await Translation.countDocuments(query);

  res.status(200).json({
    success: true,
    count: translations.length,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    data: translations
  });
});

// @desc    保存翻译
// @route   POST /api/translation/save
// @access  Private
export const saveTranslation = asyncHandler(async (req, res) => {
  const { type, detectedSigns, originalFile, resultFile, metadata, processingTime, confidence } = req.body;

  const translation = await Translation.create({
    user: req.user.id,
    type,
    detectedSigns,
    originalFile,
    resultFile,
    metadata,
    processingTime,
    confidence
  });

  res.status(201).json({
    success: true,
    data: translation
  });
});

// @desc    删除翻译记录
// @route   DELETE /api/translation/:id
// @access  Private
export const deleteTranslation = asyncHandler(async (req, res) => {
  const translation = await Translation.findById(req.params.id);

  if (!translation) {
    return res.status(404).json({
      success: false,
      error: '翻译记录不存在'
    });
  }

  // 确保只有创建者可以删除
  if (translation.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: '无权删除此翻译记录'
    });
  }

  await translation.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});





