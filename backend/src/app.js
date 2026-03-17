import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// 导入路由
import authRoutes from './routes/auth_mysql.js';
import userRoutes from './routes/user_mysql.js';
import learningRoutes from './routes/learning_mysql.js';
import translationRoutes from './routes/translation_mysql.js';
import communityRoutes from './routes/community_mysql.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications_mysql.js';
import groupRoutes from './routes/groups_mysql.js';
import groupInvitationRoutes from './routes/group_invitations_mysql.js';

// 导入中间件
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

// 导入MySQL数据库配置
import { testConnection } from './config/mysql.js';

// 加载环境变量
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"]
  }
});

// 测试MySQL连接
testConnection();

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
const isDev = (process.env.NODE_ENV || 'development') === 'development';
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
]);

app.use(cors({
  origin(origin, callback) {
    // 允许无 Origin 的请求（如本机脚本/健康检查）
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);

    // 开发环境允许 localhost / 127.0.0.1 任意端口（例如 http://localhost:4174）
    if (isDev && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      return callback(null, true);
    }

    // 开发环境允许局域网IP访问（例如 http://192.168.x.x:4174）
    if (isDev && /^http:\/\/\d{1,3}(\.\d{1,3}){3}:\d+$/.test(origin)) {
      return callback(null, true);
    }

    // 如果用户显式配置了 FRONTEND_URL，则以它为准
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
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
app.use('/public', express.static('public'));

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '服务运行正常',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'MySQL'
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/translation', translationRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/groups', groupInvitationRoutes);
app.use('/api/admin', adminRoutes);

// API文档端点
app.get('/api', (req, res) => {
  res.json({
    message: '手语教学平台 API',
    version: '1.0.0',
    database: 'MySQL',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      learning: '/api/learning',
      translation: '/api/translation',
      community: '/api/community',
      admin: '/api/admin'
    }
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
  console.log(`🗄️ 数据库: MySQL`);
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