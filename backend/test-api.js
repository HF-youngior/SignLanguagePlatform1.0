import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// 启用CORS
app.use(cors({
  origin: '*', // 在生产环境中应该限制为特定域名
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 解析JSON请求体
app.use(express.json());

// 测试API端点
app.get('/api/quiz/finger-signs/quiz', (req, res) => {
  // 返回测试数据
  res.json({
    success: true,
    data: {
      id: 1,
      sign: '你好',
      image_path: '/images/finger_signs/placeholder.svg',
      explanation_path: '/images/finger_signs_explanation/placeholder.svg',
      options: ['你好', '再见', '谢谢'],
      correct_answer: '你好'
    },
    message: '获取测验题目成功'
  });
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// 静态文件服务
app.use('/images', express.static('public/images'));

// 启动服务器
app.listen(PORT, () => {
  console.log(`测试服务器运行在端口 ${PORT}`);
  console.log(`访问测试API: http://localhost:${PORT}/api/quiz/finger-signs/quiz`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
});

