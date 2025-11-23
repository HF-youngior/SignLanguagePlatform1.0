# MediaPipe 手部检测诊断指南

## 📋 问题诊断步骤

### 1. 检查浏览器控制台

打开浏览器开发者工具（F12），查看控制台输出：

#### ✅ 正常情况应该看到：
```
MediaPipe脚本加载成功
创建MediaPipe Hands实例...
MediaPipe Hands实例创建成功
MediaPipe选项已设置
MediaPipe结果回调已设置
MediaPipe Hands 初始化成功，开始检测
开始手部检测循环...
发送图像到MediaPipe: { 帧数: 30, 视频尺寸: "640x480", ... }
MediaPipe结果回调被调用: { 有结果: true, 多手标记: 1 }
检测到手部! 位置: { ... }
```

#### ❌ 如果看到错误：

**错误1: `Cannot read properties of undefined (reading 'buffer')`**
- **原因**: MediaPipe WASM文件加载失败
- **解决方案**: 
  1. 检查网络连接
  2. 尝试使用VPN（如果CDN被屏蔽）
  3. 查看Network标签，检查哪些文件加载失败

**错误2: `MediaPipe加载失败`**
- **原因**: CDN无法访问
- **解决方案**: 
  1. 检查网络连接
  2. 系统会自动切换到unpkg CDN
  3. 如果都失败，会切换到模拟模式（鼠标控制）

**错误3: `video元素不存在` 或 `MediaPipe Hands实例不存在`**
- **原因**: 初始化顺序问题
- **解决方案**: 刷新页面重试

### 2. 检查调试信息面板

在摄像头预览窗口中，查看以下状态：

| 状态项 | 正常值 | 说明 |
|--------|--------|------|
| 摄像头状态 | MediaPipe已初始化 | MediaPipe库已加载 |
| 视频流 | ✓ | 摄像头已连接 |
| 隐藏video | ✓ 有足够数据 | 用于检测的视频元素正常 |
| MediaPipe | ✓ 已初始化 | MediaPipe实例已创建 |
| 手部检测 | ✓ | **关键**：应该显示✓ |
| 光标可见 | ✓ | **关键**：应该显示✓ |
| 光标位置 | (x, y) | 应该显示实时坐标，不是(0,0) |

### 3. 检查网络请求

在浏览器开发者工具的 **Network** 标签中：

1. 刷新页面
2. 筛选 `mediapipe` 或 `hands`
3. 检查以下文件是否成功加载：
   - `hands.js` - 应该返回200状态码
   - `hands_solution_simd_wasm_bin.js` - WASM加载器
   - `hands_solution_simd_wasm_bin.wasm` - WASM二进制文件
   - `hands_solution_simd_wasm_bin.data` - 模型数据文件

如果任何文件返回404或失败，说明CDN加载有问题。

### 4. 检查视频元素

在控制台运行以下代码检查视频状态：

```javascript
// 检查隐藏video元素
const video = document.querySelector('.hidden-video')
if (video) {
  console.log('视频状态:', {
    srcObject: !!video.srcObject,
    readyState: video.readyState,
    videoWidth: video.videoWidth,
    videoHeight: video.videoHeight,
    paused: video.paused,
    currentTime: video.currentTime
  })
} else {
  console.error('隐藏video元素不存在')
}
```

### 5. 检查MediaPipe实例

在控制台运行：

```javascript
// 检查MediaPipe
console.log('window.Hands:', window.Hands)
console.log('hands实例:', window.hands) // 如果暴露在全局
```

## 🔧 常见问题解决方案

### 问题1: 所有状态都正常，但手部检测仍然是✗

**可能原因**:
1. MediaPipe的`onResults`回调没有被调用
2. 视频没有正确传递给MediaPipe
3. MediaPipe WASM文件加载不完整

**解决方案**:
1. 查看控制台是否有"发送图像到MediaPipe"的日志
2. 查看是否有"MediaPipe结果回调被调用"的日志
3. 如果没有，说明MediaPipe没有接收到图像或处理失败

### 问题2: MediaPipe WASM文件加载失败

**解决方案**:
1. 检查网络连接
2. 尝试使用VPN
3. 或者使用本地文件（需要下载MediaPipe文件到public目录）

### 问题3: 摄像头预览是黑的

**解决方案**:
1. 检查浏览器是否允许摄像头权限
2. 检查是否有其他应用占用摄像头
3. 尝试刷新页面重新请求权限

## 🚀 手动测试MediaPipe

如果怀疑MediaPipe有问题，可以在控制台手动测试：

```javascript
// 1. 检查MediaPipe是否加载
if (window.Hands) {
  console.log('✓ MediaPipe已加载')
  
  // 2. 创建实例
  const testHands = new window.Hands({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`
    }
  })
  
  // 3. 设置选项
  testHands.setOptions({
    maxNumHands: 1,
    minDetectionConfidence: 0.5
  })
  
  // 4. 设置回调
  testHands.onResults((results) => {
    console.log('MediaPipe结果:', results)
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      console.log('✓ 检测到手部!')
    } else {
      console.log('✗ 未检测到手部')
    }
  })
  
  // 5. 获取视频元素并发送
  const video = document.querySelector('.hidden-video')
  if (video && video.readyState >= 2) {
    testHands.send({ image: video })
    console.log('✓ 已发送图像到MediaPipe')
  } else {
    console.error('✗ 视频未准备好')
  }
} else {
  console.error('✗ MediaPipe未加载')
}
```

## 📝 调试信息说明

代码中已添加详细的调试日志：

- **每30帧**：打印"发送图像到MediaPipe"的详细信息
- **每30次回调**：打印"MediaPipe结果回调被调用"的信息
- **错误时**：打印详细的错误信息和堆栈

如果控制台没有任何输出，说明：
1. MediaPipe没有初始化
2. 视频没有准备好
3. 检测循环没有运行

## 🎯 下一步

如果按照以上步骤检查后仍然无法检测手部，请：

1. **截图控制台的完整输出**
2. **截图Network标签中MediaPipe相关的请求**
3. **提供浏览器版本和操作系统信息**

这样可以帮助进一步诊断问题。

