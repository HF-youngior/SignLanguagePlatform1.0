import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['基础', '词汇', '语法', '句子', '对话', '测试'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['初级', '中级', '高级'],
    default: '初级'
  },
  content: {
    type: String,
    required: true
  },
  videoUrl: String,
  imageUrl: String,
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
}, {
  timestamps: true
});

// 索引
userProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });
userProgressSchema.index({ user: 1, completed: -1 });

export const Lesson = mongoose.model('Lesson', lessonSchema);
export const UserProgress = mongoose.model('UserProgress', userProgressSchema);

