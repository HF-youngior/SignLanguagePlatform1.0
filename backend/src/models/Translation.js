import mongoose from 'mongoose';

const translationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video', 'camera'],
    required: true
  },
  sourceText: {
    type: String
  },
  detectedSigns: [{
    className: String,
    confidence: Number,
    coordinates: {
      xmin: Number,
      ymin: Number,
      xmax: Number,
      ymax: Number
    },
    timeStamp: Number  // 对于视频，记录时间戳
  }],
  originalFile: {
    fileName: String,
    fileType: String,
    fileSize: Number,
    filePath: String
  },
  resultFile: {
    fileName: String,
    filePath: String
  },
  metadata: {
    width: Number,
    height: Number,
    duration: Number,  // 视频时长
    frameCount: Number
  },
  processingTime: Number,
  confidence: {
    type: Number,
    default: 0.5
  }
}, {
  timestamps: true
});

// 索引
translationSchema.index({ user: 1, createdAt: -1 });
translationSchema.index({ type: 1 });

export default mongoose.model('Translation', translationSchema);

