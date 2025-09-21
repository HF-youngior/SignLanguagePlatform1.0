# 手语教学平台 (Sign Language Learning Platform)
1.0
一个基于现代Web技术栈的手语教学平台，帮助用户学习手语、进行手语翻译和社区交流。

## 项目架构

```
SignLanguagePlatform/
├── frontend/                    # Vue.js/Nuxt.js 前端项目
├── backend/                     # Node.js/Express 主后端
├── ai-service/                  # Python/FastAPI AI微服务
├── docker-compose.yml           # 容器化部署配置文件
└── README.md                    # 项目说明
```

## 技术栈

### 前端
- **Vue.js 3** - 渐进式JavaScript框架
- **Nuxt.js 4** - Vue.js全栈框架
- **TypeScript** - 类型安全的JavaScript
- **Tailwind CSS** - 实用优先的CSS框架

### 后端
- **Node.js** - JavaScript运行时
- **Express.js** - Web应用框架
- **MongoDB** - NoSQL数据库
- **JWT** - 身份验证

### AI服务
- **Python 3.9+** - 编程语言
- **FastAPI** - 现代Python Web框架
- **OpenCV** - 计算机视觉库
- **MediaPipe** - 手部检测和跟踪
- **TensorFlow/PyTorch** - 机器学习框架

## 功能特性

### 🎓 学习模块
- 手语字母和词汇学习
- 交互式手语练习
- 学习进度跟踪
- 个性化学习路径

### 🔄 翻译模块
- 实时手语识别
- 手语到文字翻译
- 文字到手语转换
- 翻译历史记录

### 👥 社区模块
- 用户交流论坛
- 学习经验分享
- 手语视频分享
- 专家答疑

## 快速开始

### 环境要求
- Node.js 18+
- Python 3.9+
- MongoDB 5.0+
- Docker (可选)

### 本地开发

1. **克隆项目**
```bash
git clone <repository-url>
cd SignLanguagePlatform
```

2. **安装前端依赖**
```bash
cd frontend
npm install
```

3. **安装后端依赖**
```bash
cd ../backend
npm install
```

4. **安装AI服务依赖**
```bash
cd ../ai-service
pip install -r requirements.txt
```

5. **启动服务**
```bash
# 启动前端 (端口: 3000)
cd frontend && npm run dev

# 启动后端 (端口: 8000)
cd backend && npm run dev

# 启动AI服务 (端口: 8001)
cd ai-service && python main.py
```

### Docker部署

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 停止服务
docker-compose down
```

## 开发指南

### 项目结构说明

- `frontend/` - 前端Vue.js/Nuxt.js应用
- `backend/` - 主后端API服务
- `ai-service/` - AI手语识别和翻译服务
- `docker-compose.yml` - 容器编排配置

### API文档

- 后端API: http://localhost:8000/api/docs
- AI服务API: http://localhost:8001/docs

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

- 项目链接: [https://github.com/your-username/SignLanguagePlatform](https://github.com/your-username/SignLanguagePlatform)
- 问题反馈: [Issues](https://github.com/your-username/SignLanguagePlatform/issues)

---

**让手语学习变得简单有趣！** 👐

