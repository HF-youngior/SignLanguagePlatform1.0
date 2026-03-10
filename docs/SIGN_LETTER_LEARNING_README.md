# 手语字母学习功能说明

## 功能概述

本功能实现了手语字母A-J的交互式学习系统，包括：

1. **选择题学习模式**：显示手语图片，提供3个选项（1个正确答案 + 2个随机错误选项）
2. **答案验证**：点击错误选项变红色，正确答案变绿色
3. **说明图片**：答错后可以查看手语打法的详细说明
4. **学习进度**：按顺序学习A-J所有字母
5. **退出机制**：随时可以退出学习返回主页面

## 技术实现

### 后端API

- **数据库**：MySQL，存储手语字母信息
- **API接口**：
  - `GET /api/sign-letters/letters` - 获取所有手语字母
  - `GET /api/sign-letters/question` - 生成学习题目
  - `POST /api/sign-letters/answer` - 提交学习答案
  - `GET /api/sign-letters/progress` - 获取学习进度
  - `GET /api/sign-letters/next` - 获取下一个学习字母

### 前端组件

- **SignLetterLearning.vue**：主要学习页面
- **路由**：`/learn/sign-letters`
- **集成**：从BasicSignLearning.vue的"手指语"按钮进入

### 数据库结构

```sql
-- 手语字母表
CREATE TABLE sign_letters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  letter VARCHAR(1) NOT NULL UNIQUE,
  image_path VARCHAR(255),
  explanatio VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 学习进度表
CREATE TABLE learning_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  letter_id INT NOT NULL,
  user_id INT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (letter_id) REFERENCES sign_letters(id)
);
```

## 使用方法

### 1. 启动后端服务

```bash
cd backend
npm install
node init_database.js  # 初始化数据库
npm start
```

### 2. 启动前端服务

```bash
cd vue-frontend
npm install
npm run dev
```

### 3. 访问学习功能

1. 打开浏览器访问 `http://localhost:3001`
2. 点击"学习"进入学习中心
3. 点击"手语基础"进入基础学习页面
4. 点击"开始学习手指语"进入字母学习

## 功能特点

### 学习流程

1. **开始学习**：点击"开始学习手指语"按钮
2. **选择题模式**：
   - 显示手语图片
   - 提供3个选项（正确答案 + 2个随机错误选项）
   - 选项顺序随机打乱
3. **答案验证**：
   - 点击选项后点击"提交答案"
   - 错误选项变红色，正确答案变绿色
   - 显示结果提示
4. **说明图片**：
   - 答错后可以点击"查看说明"
   - 弹出对话框显示详细的手语打法说明
5. **继续学习**：
   - 答对或查看说明后点击"下一题"
   - 按顺序学习A-J所有字母
   - 完成后显示完成提示

### 界面特性

- **响应式设计**：支持桌面和移动设备
- **进度显示**：实时显示学习进度百分比
- **视觉反馈**：答案正确/错误的颜色提示
- **用户友好**：清晰的操作提示和错误处理

## 配置说明

### 环境变量

在 `backend/.env` 文件中配置：

```env
# MySQL配置
MYSQL_HOST=localhost
MYSQL_USER=newuser
MYSQL_PASSWORD=123qwe,./
MYSQL_DATABASE=sign_language_learning
MYSQL_PORT=3306
```

### 图片资源

- **手语图片**：`backend/public/images/finger_alphabet/[A-J].svg`
- **说明图片**：`backend/public/images/finger_alphabet_explanation/[A-J].svg`
- **静态服务**：通过 `/images/` 路径访问

## 扩展功能

### 可以添加的功能

1. **用户系统**：记录个人学习进度
2. **更多字母**：扩展到完整26个字母
3. **难度等级**：不同难度的学习模式
4. **成绩统计**：学习时间和正确率统计
5. **音效支持**：添加音效反馈
6. **动画效果**：更丰富的视觉体验

### 数据库扩展

可以添加更多表来支持高级功能：

```sql
-- 用户学习记录
CREATE TABLE user_learning_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  total_questions INT,
  correct_answers INT,
  score DECIMAL(5,2)
);

-- 学习统计
CREATE TABLE learning_statistics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  letter_id INT,
  attempts INT DEFAULT 0,
  correct_attempts INT DEFAULT 0,
  last_attempted TIMESTAMP,
  mastery_level ENUM('beginner', 'intermediate', 'advanced')
);
```

## 故障排除

### 常见问题

1. **图片不显示**：检查静态文件服务配置
2. **API连接失败**：检查后端服务是否启动
3. **数据库连接失败**：检查MySQL服务和配置
4. **前端编译错误**：检查依赖安装和Node.js版本

### 调试方法

1. 查看浏览器控制台错误信息
2. 检查后端服务器日志
3. 使用API测试工具验证接口
4. 检查数据库连接和表结构

## 总结

这个手语字母学习功能提供了一个完整的交互式学习体验，用户可以：

- 通过选择题模式学习手语字母
- 获得即时的答案反馈
- 查看详细的手语打法说明
- 跟踪学习进度
- 享受流畅的用户体验

功能已经集成到现有的学习平台中，可以通过"学习中心" → "手语基础" → "开始学习手指语"的路径访问。
































