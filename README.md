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

## 🚀 快速开始

### 📋 系统环境要求

#### 基础环境
- **Node.js**: 18.0.0+ (推荐使用 LTS 版本)
- **Python**: 3.9+ (推荐 3.9-3.11)
- **MongoDB**: 5.0+ (或使用 Docker)
- **Git**: 最新版本

#### 可选环境
- **Docker**: 20.0+ (用于容器化部署)
- **Docker Compose**: 2.0+ (用于多服务编排)

### 🔧 完整环境配置指南

#### 1. 前端服务 (Vue.js)
**位置**: `vue-frontend/` 和 `frontend/`

**依赖安装**:
```bash
cd vue-frontend
npm install
```

**主要依赖**:
- Vue 3.4.0+
- Vue Router 4.2.5+
- Element Plus 2.4.4+
- Vite 5.0.8+
- Tailwind CSS 3.4.0+
- Pinia 2.1.7+

#### 2. 后端服务 (Node.js/Express)
**位置**: `backend/`

**依赖安装**:
```bash
cd backend
npm install
```

**主要依赖**:
- Express 4.18.2+
- Mongoose 8.0.3+
- JWT 9.0.2+
- Socket.IO 4.7.4+
- CORS, Helmet, Morgan 等安全中间件

#### 3. AI服务 (Python/FastAPI)
**位置**: `ai-service/`

**环境配置**:
```bash
cd ai-service
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate
pip install -r requirements.txt
```

**主要依赖**:
- FastAPI 0.104.1+
- OpenCV 4.8.1+
- MediaPipe 0.10.7+
- PyTorch 2.1.1+
- TensorFlow 2.15.0+
- NumPy, Pandas, Matplotlib 等数据处理库

#### 4. 手语检测模块 (Python/Flask)
**位置**: `shouyuDetestion/`

**环境配置**:
```bash
cd shouyuDetestion
# 推荐使用 Anaconda
conda create -n py39 python=3.9
conda activate py39
pip install -r requirements.txt
```

**主要依赖**:
- Flask 2.3.0+
- OpenCV 4.8.0+
- Ultralytics 8.0.0+
- PyTorch 2.0.0+
- PyQt5 5.15.2+ (GUI界面)

### 🗄️ 数据库配置

#### MongoDB 配置
```bash
# 使用 Docker (推荐)
docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password123 mongo:7.0

# 或本地安装 MongoDB
# Windows: 下载 MongoDB Community Server
# Linux: sudo apt-get install mongodb
# Mac: brew install mongodb-community
```

### 📁 环境变量配置

#### 后端环境变量 (`backend/.env`)
```env
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb://localhost:27017/signlanguage
JWT_SECRET=your-super-secret-jwt-key-here
AI_SERVICE_URL=http://localhost:8001
```

#### AI服务环境变量 (`ai-service/.env`)
```env
ENVIRONMENT=development
PORT=8001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

### 🚀 启动方式

#### 方式1: 使用启动脚本 (推荐)
```bash
# Windows
start-dev.bat

# Linux/Mac
./start-dev.sh
```

#### 方式2: Docker 部署
```bash
docker-compose up -d
```

#### 方式3: 手动启动
```bash
# 1. 启动前端
cd vue-frontend && npm run dev

# 2. 启动后端
cd backend && npm run dev

# 3. 启动AI服务
cd ai-service && source .venv/bin/activate && python main.py

# 4. 启动手语检测服务
cd shouyuDetestion/backend_api && python app.py
```

### 🔍 服务端口说明

- **前端**: http://localhost:3000
- **后端API**: http://localhost:8000
- **AI服务**: http://localhost:8001
- **手语检测**: http://localhost:5000
- **MongoDB**: localhost:27017

### ⚠️ 常见问题解决

#### 1. Python环境冲突
```bash
# 使用虚拟环境隔离
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
```

#### 2. Node.js版本问题
```bash
# 使用 nvm 管理 Node.js 版本
nvm install 18
nvm use 18
```

#### 3. 依赖安装失败
```bash
# 清理缓存重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 4. 模型文件缺失
确保以下模型文件存在：
- `shouyuDetestion/models/shouyushibie_0921best.pt`
- `shouyuDetestion/models/shouyushibie_best.pt`

### 🎯 验证安装成功

1. **检查服务状态**:
   - 前端: http://localhost:3000
   - 后端健康检查: http://localhost:8000/health
   - AI服务健康检查: http://localhost:8001/health
   - 手语检测: http://localhost:5000/api/health

2. **测试API连接**:
   ```bash
   # 测试后端连接
   curl http://localhost:8000/health
   
   # 测试AI服务连接
   curl http://localhost:8001/health
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

