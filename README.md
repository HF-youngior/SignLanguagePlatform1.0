# 手语教学平台 (Sign Language Learning Platform)

一个基于现代Web技术栈的手语教学平台，提供手语学习、实时识别翻译和社区交流功能。

## 📋 项目概述

本项目采用微服务架构，集成基于YOLOv8的手语识别技术，为聋人群体和手语学习者提供全面的手语教学与交流服务。

**核心特性**：
- 🤖 基于YOLOv8的实时手语识别（支持35个手语类别）
- 🎓 完整的手语学习管理系统
- 💬 社区交流与分享平台
- 🔄 图片/视频/摄像头实时检测
- 🌐 前后端分离的微服务架构
- 📱 响应式设计，支持多设备访问

## 🏗️ 项目架构

```
SignLanguagePlatform1.0/
├── vue-frontend/              # Vue.js 3 前端应用
│   ├── src/
│   │   ├── views/            # 页面组件
│   │   │   ├── Home.vue      # 首页
│   │   │   ├── Learn.vue     # 学习模块
│   │   │   ├── Translate.vue # 翻译模块
│   │   │   └── Community.vue # 社区模块
│   │   ├── router/           # 路由配置
│   │   ├── services/         # API服务
│   │   └── assets/           # 静态资源
│   └── package.json
├── backend/                   # Node.js/Express 后端API
│   ├── src/
│   │   ├── controllers/      # 控制器
│   │   ├── models/           # 数据模型
│   │   ├── routes/           # 路由定义
│   │   ├── middleware/       # 中间件
│   │   └── config/           # 配置文件
│   └── package.json
├── shouyuDetestion/          # Python/Flask AI服务
│   ├── backend_api/
│   │   ├── app.py           # Flask API服务
│   │   └── websocket_handler.py
│   ├── models/              # YOLOv8模型文件
│   │   ├── shouyushibie_0921best.pt
│   │   └── shouyushibie_best.pt
│   ├── Config.py            # 模型配置
│   ├── detect_tools.py      # 检测工具
│   └── requirements.txt
├── docker-compose.yml        # Docker编排配置
├── start-translation-system.bat  # Windows启动脚本
└── start-translation-system.sh   # Linux/Mac启动脚本
```

## 🛠️ 技术栈

### 前端
- **Vue.js 3** (3.4.0) - 渐进式JavaScript框架
- **Vue Router** (4.2.5) - 路由管理
- **Element Plus** (2.4.4) - UI组件库
- **Pinia** (2.1.7) - 状态管理
- **Tailwind CSS** (3.4.0) - 样式框架
- **Vite** (5.0.8) - 构建工具

### 后端
- **Node.js** (18+) - JavaScript运行时
- **Express.js** (4.18.2) - Web应用框架
- **MongoDB** (5.0+) - NoSQL数据库
- **Mongoose** (8.0.3) - MongoDB对象建模
- **JWT** (9.0.2) - 身份验证
- **Socket.IO** (4.7.4) - 实时通信

### AI服务
- **Python** (3.9+) - 编程语言
- **Flask** (2.3.0+) - Web框架
- **YOLOv8** (Ultralytics 8.0.0+) - 目标检测模型
- **PyTorch** (1.9.0+) - 深度学习框架
- **OpenCV** (4.8.1) - 计算机视觉库

## ✨ 功能模块

### 🎓 学习模块
- 手语词汇学习
- 交互式练习
- 学习进度跟踪
- 个性化学习路径

### 🔄 翻译模块
- **图片检测** - 上传图片进行手语识别
- **视频检测** - 处理视频文件逐帧识别
- **实时检测** - 摄像头实时手语识别
- 翻译结果可视化
- 检测历史记录

### 👥 社区模块
- 用户交流论坛
- 学习经验分享
- 帖子发布与评论
- 点赞与互动功能
- 标签系统

### 🏠 首页
- 平台介绍
- 功能导航
- Logo与品牌展示

## 🚀 快速开始

### 环境要求

- **Node.js**: 18.0.0+ (推荐LTS版本)
- **Python**: 3.9+ (推荐3.9-3.11)
- **MongoDB**: 5.0+ (或使用Docker)
- **Git**: 最新版本

### 安装步骤

#### 1. 克隆项目

```bash
git clone <repository-url>
cd SignLanguagePlatform1.0
```

#### 2. 安装前端依赖

```bash
cd vue-frontend
npm install
```

#### 3. 安装后端依赖

```bash
cd ../backend
npm install
```

#### 4. 安装AI服务依赖

```bash
cd ../shouyuDetestion
pip install -r requirements.txt
```

#### 5. 配置环境变量

**后端环境变量** (`backend/.env`):
```env
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb://localhost:27017/signlanguage
JWT_SECRET=your-super-secret-jwt-key-here
FRONTEND_URL=http://localhost:5173
```

**AI服务配置** (`shouyuDetestion/Config.py`):
- 模型文件路径已配置为 `models/shouyushibie_0921best.pt`
- 无需额外配置，确保模型文件存在于 `shouyuDetestion/models/` 目录

#### 6. 启动MongoDB

```bash
# 使用Docker (推荐)
docker run -d --name mongodb -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  mongo:7.0

# 或本地安装的MongoDB
# Windows: 启动MongoDB服务
# Linux: sudo systemctl start mongod
# Mac: brew services start mongodb-community
```

### 启动方式

#### 方式1: 使用启动脚本 (推荐)

**Windows**:
```bash
start-translation-system.bat
```

**Linux/Mac**:
```bash
chmod +x start-translation-system.sh
./start-translation-system.sh
```

#### 方式2: 手动启动

**终端1 - 启动AI服务**:
```bash
cd shouyuDetestion/backend_api
python app.py
```
服务运行在: http://localhost:5000

**终端2 - 启动后端API**:
```bash
cd backend
npm run dev
```
服务运行在: http://localhost:8000

**终端3 - 启动前端**:
```bash
cd vue-frontend
npm run dev
```
服务运行在: http://localhost:5173

### 🔍 服务端口说明

| 服务 | 端口 | 访问地址 |
|------|------|----------|
| 前端 | 5173 | http://localhost:5173 |
| 后端API | 8000 | http://localhost:8000 |
| AI服务 | 5000 | http://localhost:5000 |
| MongoDB | 27017 | localhost:27017 |

### ✅ 验证安装

1. **检查AI服务**:
   ```bash
   curl http://localhost:5000/api/health
   ```
   应返回: `{"status":"ok","message":"手语翻译系统运行正常","model_loaded":true}`

2. **检查后端API**:
   ```bash
   curl http://localhost:8000/health
   ```

3. **访问前端**: 打开浏览器访问 http://localhost:5173

## 📖 API文档

### AI服务API (端口: 5000)

- `GET /api/health` - 健康检查
- `POST /api/detect/image` - 图片检测
  - 请求: `multipart/form-data` 包含 `image` 文件
  - 返回: 检测结果JSON数组
- `POST /api/detect/video` - 视频检测
  - 请求: `multipart/form-data` 包含 `video` 文件
  - 返回: 处理后的视频文件路径
- `POST /api/detect/camera` - 摄像头实时检测 (WebSocket)

### 后端API (端口: 8000)

- `GET /health` - 健康检查
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/users/profile` - 获取用户资料
- `GET /api/learning/lessons` - 获取课程列表
- `GET /api/community/posts` - 获取社区帖子

## 🗄️ 数据库配置

项目使用MongoDB存储用户数据、学习记录和社区内容。

### MongoDB连接

在 `backend/.env` 中配置:
```env
MONGODB_URI=mongodb://localhost:27017/signlanguage
```

或使用带认证的连接:
```env
MONGODB_URI=mongodb://username:password@localhost:27017/signlanguage?authSource=admin
```

详细配置说明请参考: [数据库连接说明.md](./数据库连接说明.md)

## 🐳 Docker部署

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## ⚠️ 常见问题

### 1. Python环境问题

```bash
# 推荐使用虚拟环境
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

### 2. 模型文件缺失

确保以下模型文件存在:
- `shouyuDetestion/models/shouyushibie_0921best.pt`
- `shouyuDetestion/models/shouyushibie_best.pt`

### 3. Node.js版本问题

```bash
# 使用nvm管理Node.js版本
nvm install 18
nvm use 18
```

### 4. 依赖安装失败

```bash
# 清理缓存重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 5. 端口被占用

如果端口被占用，可以修改:
- 前端端口: `vue-frontend/vite.config.js`
- 后端端口: `backend/.env` 中的 `PORT`
- AI服务端口: `shouyuDetestion/backend_api/app.py` 中的 `app.run()`

## 📚 相关文档

- [项目介绍](./PROJECT_INTRODUCTION.md) - 详细的项目说明
- [项目总结](./PROJECT_SUMMARY.md) - 项目总结文档
- [技术攻关报告](./项目技术攻关与难点分析报告.md) - 技术难点与解决方案
- [翻译功能配置](./翻译功能配置说明.md) - 翻译模块配置说明
- [数据库连接说明](./数据库连接说明.md) - 数据库配置详细说明

## 🔀 Git 协作教程

### 📤 上传本地修改到远端分支

#### 场景1: 将本地 yyh 分支推送到远端 yyh 分支

```bash
# 1. 确保在正确的分支上
git branch  # 查看当前分支
git checkout yyh  # 切换到 yyh 分支

# 2. 添加修改的文件
git add .  # 添加所有修改的文件
# 或者指定文件: git add src/components/MyComponent.vue

# 3. 提交修改
git commit -m "feat: 添加新功能描述"

# 4. 推送到远端 yyh 分支
git push origin yyh
```

#### 场景2: 如果远端分支不存在，需要创建并推送

```bash
# 推送并设置上游分支
git push -u origin yyh
```

### 📥 合并其他分支的修改

#### 场景1: 将远端 jlc 分支合并到本地 yyh 分支

```bash
# 1. 确保在 yyh 分支上
git checkout yyh

# 2. 获取远端最新信息
git fetch origin

# 3. 查看远端分支
git branch -r  # 查看所有远端分支

# 4. 合并远端 jlc 分支到当前 yyh 分支
git merge origin/jlc

# 5. 如果有冲突，解决冲突后提交
git add .
git commit -m "merge: 合并 jlc 分支的修改"

# 6. 推送到远端
git push origin yyh
```

#### 场景2: 使用 rebase 保持提交历史整洁

```bash
# 1. 获取远端最新信息
git fetch origin

# 2. 使用 rebase 合并
git rebase origin/jlc

# 3. 如果有冲突，解决后继续
git add .
git rebase --continue

# 4. 推送到远端
git push origin yyh
```

### 🔄 完整的协作流程

#### 日常开发流程

```bash
# 1. 开始新功能前，先同步最新代码
git checkout yyh
git fetch origin
git merge origin/main  # 或 git rebase origin/main

# 2. 创建功能分支（可选）
git checkout -b feature/new-feature

# 3. 开发并提交
git add .
git commit -m "feat: 实现新功能"

# 4. 推送到远端
git push origin feature/new-feature

# 5. 创建 Pull Request 或直接合并
```

#### 处理冲突

```bash
# 当合并时出现冲突
git status  # 查看冲突文件
# 手动编辑冲突文件，解决冲突
git add .  # 标记冲突已解决
git commit -m "resolve: 解决合并冲突"
```

### 🛠️ 常用 Git 命令

```bash
# 查看状态
git status
git log --oneline  # 查看提交历史
git branch -a      # 查看所有分支

# 撤销操作
git reset --soft HEAD~1    # 撤销最后一次提交，保留修改
git reset --hard HEAD~1    # 撤销最后一次提交，丢弃修改
git checkout -- <file>     # 撤销单个文件的修改

# 远程操作
git remote -v              # 查看远程仓库
git fetch origin           # 获取远程更新
git pull origin <branch>   # 拉取并合并远程分支
```

### ⚠️ 注意事项

1. **提交前检查**: 使用 `git status` 和 `git diff` 检查修改
2. **提交信息规范**: 使用清晰的提交信息，如 `feat:`, `fix:`, `docs:` 等
3. **分支保护**: 不要直接在 main 分支上开发
4. **冲突处理**: 遇到冲突时仔细检查，确保不丢失重要代码
5. **备份重要修改**: 在重大操作前先备份或创建分支

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📮 联系方式

- 项目链接: [GitHub Repository](https://github.com/your-username/SignLanguagePlatform)
- 问题反馈: [Issues](https://github.com/your-username/SignLanguagePlatform/issues)

---

**让手语学习变得简单有趣！** 👐

