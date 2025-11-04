# 视频实时检测功能使用指南

## 功能概述

现在视频翻译功能已经完全改为**实时检测模式**：
- ✅ 视频选择后立即显示并可播放
- ✅ 点击"开始实时检测"后，每2秒自动检测当前播放的帧
- ✅ 检测框实时显示在视频上
- ✅ 可以随时停止检测
- ✅ 不等待整个视频处理完成

## 使用流程

### 1. 选择视频
- 点击"选择视频"按钮
- 选择本地MP4或其他视频文件
- 视频立即显示在左侧，可以正常播放

### 2. 开始实时检测
- 点击"开始实时检测"按钮
- 系统每2秒自动检测当前播放的帧
- 检测框会实时显示在视频上
- 检测结果会显示在右侧表格中

### 3. 播放和控制
- 可以正常播放、暂停、拖动视频进度条
- 检测框会跟随当前播放的帧显示
- 右侧表格会累积所有检测到的目标

### 4. 停止检测
- 点击"停止检测"按钮
- 检测会立即停止
- 已检测的结果会保留
- 可以继续播放视频但不再进行检测

## 技术实现

### 前端流程

```javascript
// 1. 选择视频 - 立即显示
handleVideoUpload() {
  currentVideo.value = videoURL
}

// 2. 开始实时检测
startRealtimeDetection() {
  // 每2秒检测一次
  setInterval(() => {
    if (video.paused) return
    captureAndDetect()
  }, 2000)
}

// 3. 捕获当前帧并检测
captureAndDetect() {
  // 捕获视频当前帧
  canvas.drawImage(video, 0, 0)
  
  // 转换为blob并发送到后端
  canvas.toBlob(async (blob) => {
    const result = await api.detectImage(blob)
    drawDetectionBoxes(result.detections)
  })
}

// 4. 绘制检测框
drawFrameDetections(detections) {
  // 在canvas overlay上绘制
  ctx.strokeRect(x, y, width, height)
  ctx.fillText(label, x, y)
}
```

### Canvas叠加层

```vue
<div class="relative w-full h-full">
  <video 
    ref="videoElement"
    :src="currentVideo" 
    controls
    @loadeddata="onVideoLoaded"
  />
  <canvas 
    ref="canvasOverlay"
    class="absolute pointer-events-none"
    :style="{ width: videoWidth + 'px', height: videoHeight + 'px' }"
  />
</div>
```

### 后端API调用

```javascript
// 每2秒调用图片检测API
const result = await apiService.detectImage(
  currentFrameBlob,      // 当前帧的blob
  confidenceThreshold.value
)

// 返回结果格式
{
  detections: [
    {
      className: "手语类别",
      confidence: 95.23,
      coordinates: { xmin, ymin, xmax, ymax }
    }
  ]
}
```

## 功能特点

### 1. 实时性
- 每2秒检测一次当前播放的帧
- 不等待整个视频处理完
- 检测框立即显示

### 2. 可控制
- 点击"开始实时检测"开始
- 点击"停止检测"停止
- 可以随时暂停/播放视频

### 3. 累积结果
- 所有检测到的目标都会保存在右侧表格
- 检测框只显示当前帧的检测结果
- 可以查看完整的历史检测结果

### 4. 非阻塞UI
- 视频选择后立即显示
- 不等待后端处理
- 界面流畅响应

## 操作说明

### 视频操作面板

当视频加载后，会显示一个新的"视频操作"卡片：

```
┌─────────────────────┐
│   视频操作          │
├─────────────────────┤
│ [开始实时检测]      │  ← 点击开始检测
│ [停止检测]          │  ← 检测中显示
└─────────────────────┘
```

### 状态说明

- **未检测**：只显示"开始实时检测"按钮
- **检测中**：显示"正在检测..."按钮（禁用）和"停止检测"按钮
- **已停止**：恢复为"开始实时检测"按钮

## 注意事项

1. **检测频率**：默认每2秒检测一次，避免过于频繁
2. **检测时机**：只在视频播放时检测，暂停时不检测
3. **结果累积**：所有检测结果都会累积显示在表格中
4. **检测框显示**：只显示当前帧的检测框，结果表格显示所有结果

## 常见问题

### Q: 为什么检测框一闪而过？
A: 这是正常的，检测框只显示当前播放帧的检测结果。当视频继续播放时，会检测新的帧。

### Q: 可以调整检测频率吗？
A: 目前固定为每2秒检测一次。如果需要调整，可以修改代码中的`setInterval`参数。

### Q: 处理长时间视频会不会很慢？
A: 不会，因为是实时检测，不会预处理整个视频。只会检测当前播放的帧。

### Q: 可以同时检测多个视频吗？
A: 目前不支持，一次只能处理一个视频。

## 未来改进

1. **自定义检测频率**：允许用户设置检测间隔
2. **跳帧优化**：检测时可以显示之前的检测结果
3. **结果过滤**：可以过滤低置信度的检测结果
4. **导出功能**：可以导出所有检测结果为JSON或CSV
5. **批处理模式**：支持自动检测整个视频（选项）

## 总结

现在的视频翻译功能：
- ✅ 视频立即显示并可播放
- ✅ 实时检测当前播放的帧
- ✅ 检测框实时显示
- ✅ 可控制开始/停止
- ✅ 用户体验大幅改善
- ✅ 不阻塞界面

享受实时手语检测的便利吧！

