# 手语翻译系统移植到Vue项目详细计划

## 项目概述
将现有的PyQt5桌面手语翻译系统移植到Vue网页项目中，作为翻译板块的新页面。

## 技术架构

### 前端架构
- **框架**: Vue 3 + Composition API
- **UI库**: Element Plus / Ant Design Vue
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP客户端**: Axios
- **WebSocket**: 原生WebSocket API
- **图像处理**: Canvas API

### 后端架构
- **框架**: Flask + Flask-CORS
- **AI模型**: YOLOv8 (ultralytics)
- **图像处理**: OpenCV + PIL
- **实时通信**: WebSocket
- **文件处理**: 支持图片/视频上传

## 移植步骤

### 第一阶段：环境准备 (1-2天)

#### 1.1 后端环境搭建
```bash
# 创建后端项目目录
mkdir sign-language-backend
cd sign-language-backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 复制现有模型文件
cp -r /path/to/original/models ./models
cp -r /path/to/original/Font ./Font
cp -r /path/to/original/save_data ./save_data
```

#### 1.2 前端环境搭建
```bash
# 在现有Vue项目中创建新页面
# 假设现有项目结构：
# vue-project/
# ├── src/
# │   ├── components/
# │   ├── views/
# │   └── router/

# 创建手语翻译相关文件
mkdir src/views/sign-language
mkdir src/components/sign-language
mkdir src/api/sign-language
```

### 第二阶段：后端API开发 (3-4天)

#### 2.1 核心API接口
- [x] `/api/health` - 健康检查
- [x] `/api/detect/image` - 图片检测
- [x] `/api/detect/video` - 视频检测  
- [x] `/api/detect/batch` - 批量图片检测
- [x] `/api/detect/camera` - 摄像头检测
- [x] `/api/save/results` - 保存结果
- [x] `/api/models/info` - 模型信息

#### 2.2 WebSocket实时通信
- [x] 摄像头实时检测
- [x] 检测结果实时推送
- [x] 心跳检测机制

#### 2.3 文件处理优化
```python
# 添加文件大小限制
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB

# 添加文件类型验证
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'avi', 'mov'}
```

### 第三阶段：前端组件开发 (4-5天)

#### 3.1 核心组件结构
```
src/views/sign-language/
├── SignLanguageDetector.vue     # 主检测页面
├── components/
│   ├── ImageUploader.vue       # 图片上传组件
│   ├── VideoPlayer.vue         # 视频播放组件
│   ├── CameraCapture.vue       # 摄像头捕获组件
│   ├── DetectionResults.vue    # 检测结果展示组件
│   ├── ParameterControls.vue    # 参数控制组件
│   └── ResultsTable.vue        # 结果表格组件
└── api/
    └── signLanguage.js         # API接口封装
```

#### 3.2 状态管理 (Pinia)
```javascript
// stores/signLanguage.js
export const useSignLanguageStore = defineStore('signLanguage', {
  state: () => ({
    detectionResults: [],
    currentImage: null,
    isDetecting: false,
    parameters: {
      confidence: 0.5,
      delay: 10
    }
  }),
  
  actions: {
    async detectImage(image) {
      // 检测逻辑
    },
    
    async detectVideo(video) {
      // 视频检测逻辑
    }
  }
})
```

#### 3.3 路由配置
```javascript
// router/index.js
{
  path: '/sign-language',
  name: 'SignLanguage',
  component: () => import('@/views/sign-language/SignLanguageDetector.vue'),
  meta: {
    title: '手语翻译',
    requiresAuth: true
  }
}
```

### 第四阶段：功能集成 (3-4天)

#### 4.1 图像处理集成
- Canvas绘制检测框
- 图片缩放和适配
- 检测结果可视化

#### 4.2 实时检测集成
- WebSocket连接管理
- 摄像头权限处理
- 实时检测结果展示

#### 4.3 文件上传优化
- 拖拽上传
- 进度显示
- 文件类型验证
- 批量处理

### 第五阶段：UI/UX优化 (2-3天)

#### 5.1 响应式设计
```css
/* 移动端适配 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .control-panel {
    width: 100%;
  }
}
```

#### 5.2 用户体验优化
- 加载状态指示
- 错误处理提示
- 操作引导
- 快捷键支持

### 第六阶段：测试和部署 (2-3天)

#### 6.1 功能测试
- [ ] 图片检测测试
- [ ] 视频检测测试
- [ ] 摄像头检测测试
- [ ] 批量处理测试
- [ ] 结果保存测试

#### 6.2 性能优化
- 图片压缩
- 检测结果缓存
- 内存管理
- 并发处理

#### 6.3 部署配置
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend_api
    ports:
      - "5000:5000"
    volumes:
      - ./models:/app/models
      - ./save_data:/app/save_data
  
  frontend:
    build: ./vue-frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

## 集成到现有Vue项目

### 1. 添加路由
```javascript
// 在现有项目的router中添加
{
  path: '/translation/sign-language',
  name: 'SignLanguageTranslation',
  component: () => import('@/views/translation/SignLanguageDetector.vue'),
  meta: {
    title: '手语翻译',
    icon: 'sign-language'
  }
}
```

### 2. 添加导航菜单
```vue
<!-- 在现有项目的导航组件中添加 -->
<el-menu-item index="/translation/sign-language">
  <el-icon><SignLanguage /></el-icon>
  <span>手语翻译</span>
</el-menu-item>
```

### 3. 权限控制
```javascript
// 在路由守卫中添加权限检查
router.beforeEach((to, from, next) => {
  if (to.path.includes('/translation/sign-language')) {
    // 检查用户是否有翻译权限
    if (hasTranslationPermission()) {
      next()
    } else {
      next('/unauthorized')
    }
  } else {
    next()
  }
})
```

## 部署方案

### 开发环境
```bash
# 后端启动
cd backend_api
python app.py

# 前端启动
cd vue-project
npm run dev
```

### 生产环境
```bash
# 使用Docker部署
docker-compose up -d

# 或使用PM2管理
pm2 start ecosystem.config.js
```

## 注意事项

### 1. 模型文件处理
- 确保模型文件路径正确
- 考虑模型文件大小和加载时间
- 实现模型懒加载

### 2. 浏览器兼容性
- 摄像头API需要HTTPS
- Canvas API兼容性
- WebSocket连接稳定性

### 3. 性能优化
- 图片压缩上传
- 检测结果缓存
- 内存泄漏防护

### 4. 安全考虑
- 文件上传安全检查
- API接口权限验证
- 跨域请求配置

## 预期时间线
- **总开发时间**: 15-20天
- **测试时间**: 3-5天  
- **部署时间**: 2-3天
- **总计**: 20-28天

## 风险评估
1. **技术风险**: 浏览器兼容性、摄像头权限
2. **性能风险**: 大文件上传、实时检测延迟
3. **集成风险**: 与现有项目架构冲突

## 成功标准
1. 所有原有功能完整移植
2. 界面响应式设计良好
3. 检测准确率保持原有水平
4. 用户体验流畅
5. 与现有项目无缝集成
