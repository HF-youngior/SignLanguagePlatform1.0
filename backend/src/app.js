import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import os from 'os';

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
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
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
app.use(cors({
  origin: '*', // 允许所有来源，在生产环境中应该设置具体的域名
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

// 监听所有网络接口，允许通过IP地址访问
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 服务器成功启动！`);
  console.log(`📡 服务器运行在 http://localhost:${PORT}`);
  // 获取网络接口信息
  const interfaces = os.networkInterfaces();
  let networkAddress = '127.0.0.1';
  // 查找非本地的IPv4地址
  for (const interfaceName in interfaces) {
    const iface = interfaces[interfaceName];
    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal && addr.address !== '127.0.0.1') {
        networkAddress = addr.address;
        break;
      }
    }
    if (networkAddress !== '127.0.0.1') break;
  }
  console.log(`🌐 网络访问地址: http://${networkAddress}:${PORT}`);
  console.log(`📚 API文档地址: http://localhost:${PORT}/api`);
  console.log(`🏥 健康检查地址: http://localhost:${PORT}/health`);
  console.log(`\n✅ 后端服务已就绪\n`);
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