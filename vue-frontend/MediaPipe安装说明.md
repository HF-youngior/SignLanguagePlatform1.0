# MediaPipe 安装说明

## 📦 安装依赖

由于我们改用npm安装MediaPipe而不是CDN，需要先安装依赖：

```bash
cd vue-frontend
npm install
```

这会安装 `@mediapipe/hands` 包到 `node_modules` 目录。

## 🔧 开发环境配置

在开发环境中，Vite会自动处理 `node_modules` 中的文件。MediaPipe的WASM文件会通过Vite的开发服务器提供。

## 🚀 使用说明

1. **安装依赖**：
   ```bash
   npm install
   ```

2. **启动开发服务器**：
   ```bash
   npm run dev
   ```

3. **访问页面**：
   - 打开浏览器访问 `http://localhost:3000`
   - 允许摄像头权限
   - 点击左上角按钮切换到"手部识别"模式

## ✨ 新功能

### 1. 多朵花支持
- 现在可以放置多朵花，不再限制为一朵
- 右键点击花苞会让最近创建的花苞绽放

### 2. 手部模式改进
- 即使没有检测到手部，也可以选择手部识别模式
- 不会自动切换回鼠标模式
- 等待MediaPipe加载完成后会自动开始检测

### 3. 预览视频中的手部骨架
- 在摄像头预览窗口中，如果检测到手部，会显示绿色的骨架线条
- 红色圆点表示手部关键点
- 黄色高亮表示指尖位置

## 🐛 故障排查

### 问题1: MediaPipe文件404错误

如果看到 `Cannot GET /node_modules/@mediapipe/hands/...` 错误：

**解决方案**：
1. 确保已运行 `npm install`
2. 检查 `node_modules/@mediapipe/hands` 目录是否存在
3. 重启开发服务器

### 问题2: MediaPipe仍然无法加载

**解决方案**：
1. 删除 `node_modules` 和 `package-lock.json`
2. 重新运行 `npm install`
3. 检查网络连接（首次安装需要下载文件）

### 问题3: 预览视频中没有显示骨架

**解决方案**：
1. 确保手部在摄像头视野内
2. 检查"手部检测"状态是否为"✓"
3. 查看控制台是否有错误信息

## 📝 注意事项

- MediaPipe的WASM文件较大，首次加载可能需要一些时间
- 如果网络较慢，可能需要等待几秒钟
- 在生产环境中，需要将MediaPipe文件复制到public目录（或使用CDN）

