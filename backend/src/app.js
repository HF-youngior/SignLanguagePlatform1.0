import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// 导入路由
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import learningRoutes from './routes/learning.js';
import translationRoutes from './routes/translation.js';
import communityRoutes from './routes/community.js';
import signLetterRoutes from './routes/signLetter.js';
import quizRoutes from './routes/quiz.js';
import fingerSignRoutes from './routes/fingerSign.js';

// 导入中间件
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

// 导入数据库配置
import { connectDB } from './config/database.js';

// 加载环境变量
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// 连接数据库
connectDB();

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

// CORS配置
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 请求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: {
    error: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// 数据清理中间件
app.use(mongoSanitize()); // 防止NoSQL注入
app.use(xss()); // 防止XSS攻击

// 压缩响应
app.use(compression());

// 日志中间件
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 解析JSON和URL编码数据
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static('uploads'));
app.use('/images', express.static('public/images'));

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '服务运行正常',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/translation', translationRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/sign-letters', signLetterRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/quiz', fingerSignRoutes);

// API文档端点
app.get('/api', (req, res) => {
  res.json({
    message: '手语教学平台 API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      learning: '/api/learning',
      translation: '/api/translation',
      community: '/api/community',
      signLetters: '/api/sign-letters',
      quiz: '/api/quiz',
      fingerSigns: '/api/quiz/finger-signs'
    },
    documentation: '/api/docs'
  });
});

// Socket.IO连接处理
io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);
  
  // 加入学习房间
  socket.on('join-learning', (data) => {
    socket.join(`learning-${data.userId}`);
    console.log(`用户 ${data.userId} 加入学习房间`);
  });
  
  // 加入社区房间
  socket.on('join-community', (data) => {
    socket.join(`community-${data.roomId}`);
    console.log(`用户加入社区房间 ${data.roomId}`);
  });
  
  // 实时翻译
  socket.on('translation-request', (data) => {
    // 处理实时翻译请求
    socket.emit('translation-response', {
      id: data.id,
      result: '翻译结果',
      confidence: 0.95
    });
  });
  
  // 断开连接
  socket.on('disconnect', () => {
    console.log('用户断开连接:', socket.id);
  });
});

// 404处理
app.use(notFound);

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📚 API文档: http://localhost:${PORT}/api`);
  console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

export { app, io };
