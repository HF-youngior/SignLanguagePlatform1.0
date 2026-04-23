# 手语学习平台项目说明

## 项目简介

手语学习平台是一个集手语学习、实时翻译、社区互动于一体的综合性平台。该平台旨在为用户提供便捷的手语学习途径，通过场景化学习和实时翻译功能，帮助用户快速掌握手语技能，促进听障人士与健听人士之间的沟通交流。

### 核心功能

- **场景化学习**：通过真实场景模拟，让用户在实际情境中学习手语
- **实时翻译**：利用AI技术实现手语与文字的实时互译
- **社区互动**：用户可以在社区中分享学习心得，交流经验
- **关卡挑战**：通过闯关模式，逐步提升手语技能
- **个人中心**：记录学习进度，管理个人信息

## 项目架构

项目采用前后端分离架构，主要分为以下几个部分：

### 1. 前端部分 (`vue-frontend/`)

- **框架**：Vue 3 + Vite
- **UI组件**：自定义组件 + Tailwind CSS
- **路由管理**：Vue Router
- **状态管理**：Pinia
- **核心功能模块**：
  - 学习模块 (`Learn.vue`)
  - 翻译模块 (`Translate.vue`)
  - 社区模块 (`Community.vue`)
  - 挑战模式 (`ChallengeMode.vue`)
  - 个人中心 (`Profile.vue`)

### 2. 后端部分 (`backend/`)

- **框架**：Express.js
- **数据库**：MySQL (阿里云RDS)
- **API接口**：RESTful API
- **核心功能模块**：
  - 用户认证与授权
  - 学习进度管理
  - 社区内容管理
  - 翻译服务接口

### 3. AI服务部分 (`ai-service/` 和 `shouyuDetestion/`)

- **功能**：手语识别与翻译
- **技术**：深度学习模型 + 计算机视觉
- **接口**：WebSocket 实时通信

### 4. 部署与配置

- **容器化**：Docker + Docker Compose
- **环境配置**：`.env` 文件管理敏感信息
- **启动脚本**：`scripts/` 目录下的批处理文件

## 目录结构

```
SignLanguagePlatform1.0/
├── ai-service/          # AI服务相关代码
├── backend/             # 后端服务
│   ├── src/             # 源代码
│   ├── scripts/         # 数据库初始化脚本
│   └── .env             # 环境配置文件
├── docs/                # 项目文档
├── scripts/             # 启动和部署脚本
├── shouyuDetestion/     # 手语检测相关代码
├── vue-frontend/        # 前端应用
│   ├── src/             # 源代码
│   └── public/          # 静态资源
└── README.md            # 项目说明文档
```

## 环境要求

### 前端环境

- Node.js 16.x 或更高版本
- npm 7.x 或更高版本

### 后端环境

- Node.js 16.x 或更高版本
- MySQL 5.7 或更高版本

### AI服务环境

- Python 3.8 或更高版本
- PyTorch 1.7 或更高版本
- OpenCV 4.0 或更高版本

## 安装与运行

### 1. 前端安装与运行

```bash
# 进入前端目录
cd vue-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

前端服务默认运行在 `http://localhost:3000`

### 2. 后端安装与运行

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
# 复制 env.example 为 .env 并填写相关配置

# 启动后端服务
npm start
```

后端服务默认运行在 `http://localhost:8000`

### 3. AI服务运行

```bash
# 进入手语检测目录
cd shouyuDetestion/backend_api

# 安装依赖
pip install -r requirements.txt

# 启动AI服务
python app.py
```

AI服务默认运行在 `http://localhost:5000`

## 数据库配置

### 1. 数据库连接

后端使用MySQL数据库，配置信息在 `backend/.env` 文件中：

```env
# 数据库连接信息
MYSQL_HOST=rm-2zelg8vzn3xb07mvako.mysql.rds.aliyuncs.com
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=csl
MYSQL_PORT=3306
```

### 2. 数据库初始化

```bash
# 进入后端目录
cd backend

# 运行数据库初始化脚本
node scripts/init_mysql_database.js
```

## 核心API接口

### 1. 用户相关

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息

### 2. 学习相关

- `GET /api/learning/levels` - 获取学习关卡
- `POST /api/learning/progress` - 更新学习进度
- `GET /api/learning/signs` - 获取手语词汇

### 3. 社区相关

- `GET /api/community/posts` - 获取社区帖子
- `POST /api/community/posts` - 发布帖子
- `POST /api/community/comments` - 发表评论

### 4. 翻译相关

- `POST /api/translate/text-to-sign` - 文字转手语
- `POST /api/translate/sign-to-text` - 手语转文字

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 前端 | Vue 3 | ^3.2.0 |
| 前端 | Vite | ^2.9.0 |
| 前端 | Tailwind CSS | ^3.0.0 |
| 后端 | Express.js | ^4.17.0 |
| 后端 | MySQL | ^5.7.0 |
| AI服务 | Python | ^3.8.0 |
| AI服务 | PyTorch | ^1.7.0 |
| 部署 | Docker | ^20.0.0 |

## 常见问题与解决方案

### 1. 数据库连接失败

- 检查 `.env` 文件中的数据库配置是否正确
- 确保阿里云RDS数据库实例状态正常
- 检查网络连接是否畅通

### 2. 前端页面加载缓慢

- 检查网络连接
- 清除浏览器缓存
- 确保后端服务正常运行

### 3. 手语识别不准确

- 确保光线充足
- 保持手部在摄像头范围内
- 确保背景简洁，避免干扰

## 项目维护与更新

### 代码规范

- 前端代码遵循 Vue 3 官方规范
- 后端代码遵循 Node.js 最佳实践
- 提交代码前运行 lint 检查

### 版本管理

- 使用 Git 进行版本控制
- 遵循语义化版本规范
- 定期备份数据库

## 联系方式

如有问题或建议，欢迎联系项目维护者：

- 邮箱：contact@signlanguageplatform.com
- 项目地址：https://github.com/signlanguageplatform

---

感谢使用手语学习平台！希望本平台能够帮助您更好地学习和使用手语，促进无障碍沟通。