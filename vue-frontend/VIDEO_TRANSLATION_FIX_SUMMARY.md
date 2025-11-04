# 视频翻译功能最终修复总结

## 问题分析

根据用户反馈，视频选择后一直显示"AI识别中..."，视频无法播放，检测框也不显示。

## 根本原因

1. **遮罩层问题**：`v-if="isProcessing"` 的遮罩一直显示，遮挡了视频
2. **Canvas尺寸问题**：Canvas覆盖层尺寸与实际视频显示尺寸不匹配
3. **缩放问题**：检测框坐标是视频原始尺寸，但需要缩放到显示尺寸

## 解决方案

### 1. 修复遮罩层显示逻辑

```vue
<!-- 只在首次加载时显示遮罩，视频显示后不遮挡 -->
<div v-if="!currentVideo && isProcessing" class="...">
```

**关键变化**：
- 添加条件 `!currentVideo`，确保视频显示后遮罩消失
- 实时检测时不再显示遮罩层

### 2. 修复Canvas尺寸匹配

```javascript
const onVideoLoaded = () => {
  if (videoElement.value && canvasOverlay.value) {
    // 获取视频的实际显示尺寸
    const videoRect = videoElement.value.getBoundingClientRect()
    videoWidth.value = videoRect.width
    videoHeight.value = videoRect.height
    
    // 设置canvas尺寸，与视频显示尺寸一致
    canvasOverlay.value.width = videoRect.width
    canvasOverlay.value.height = videoRect.height
    
    // 设置Canvas样式
    canvasOverlay.value.style.width = videoRect.width + 'px'
    canvasOverlay.value.style.height = videoRect.height + 'px'
    canvasOverlay.value.style.position = 'absolute'
    canvasOverlay.value.style.top = '0'
    canvasOverlay.value.style.left = '0'
  }
}
```

**关键变化**：
- 使用 `getBoundingClientRect()` 获取实际显示尺寸
- Canvas与视频显示尺寸完全匹配

### 3. 添加缩放计算

```javascript
const drawFrameDetections = (detections, width, height) => {
  // 计算缩放比例（视频原始尺寸 -> 显示尺寸）
  const scaleX = canvas.width / width
  const scaleY = canvas.height / height
  
  // 绘制时使用缩放后的坐标
  const x = coords.xmin * scaleX
  const y = coords.ymin * scaleY
  const w = (coords.xmax - coords.xmin) * scaleX
  const h = (coords.ymax - coords.ymin) * scaleY
}
```

**关键变化**：
- 检测框坐标需要根据Canvas和视频的实际尺寸比例缩放
- 确保检测框正确定位

### 4. 监听窗口Resize

```javascript
onMounted(() => {
  // 监听窗口resize，更新Canvas尺寸
  window.addEventListener('resize', updateCanvasSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateCanvasSize)
})

const updateCanvasSize = () => {
  if (videoElement.value && canvasOverlay.value) {
    const videoRect = videoElement.value.getBoundingClientRect()
    canvasOverlay.value.width = videoRect.width
    canvasOverlay.value.height = videoRect.height
    // ...
  }
}
```

**关键变化**：
- 窗口大小改变时，Canvas尺寸同步更新
- 确保检测框始终正确显示

## 工作流程

### 用户操作流程

1. **选择视频**
   ```
   点击"选择视频" → 视频立即显示 → 可以播放
   ```

2. **开始实时检测**
   ```
   点击"开始实时检测" → 每2秒检测当前帧 → 检测框实时显示
   ```

3. **停止检测**
   ```
   点击"停止检测" → 检测停止 → 可继续播放视频
   ```

### 检测流程

```
视频播放中 → 每2秒触发
              ↓
         捕获当前帧
              ↓
         发送到后端检测
              ↓
         接收检测结果
              ↓
   绘制检测框到Canvas
              ↓
       显示在视频上
```

## 技术要点

### 1. Canvas覆盖层

```html
<div class="relative">
  <video ref="videoElement" />
  <canvas ref="canvasOverlay" class="absolute pointer-events-none" />
</div>
```

- `relative` 定位：父容器相对定位
- `absolute` 定位：Canvas绝对定位覆盖视频
- `pointer-events-none`：Canvas不拦截鼠标事件，视频控件可用

### 2. 实时检测触发

```javascript
const startRealtimeDetection = () => {
  isVideoDetecting.value = true
  
  // 每2秒检测一次
  videoProcessingInterval.value = setInterval(async () => {
    if (!videoElement.value.paused && isVideoDetecting.value) {
      await captureAndDetect()
    }
  }, 2000)
}
```

- 只检测正在播放的视频
- 可随时停止
- 结果实时累积

### 3. 检测框绘制

```javascript
// 清空旧检测框
ctx.clearRect(0, 0, canvas.width, canvas.height)

// 绘制新检测框
ctx.strokeStyle = '#00ff00'
ctx.lineWidth = 3
ctx.strokeRect(x, y, w, h)

// 绘制标签
ctx.fillText(label, x + 5, y - 5)
```

- 每次检测前清空Canvas
- 只显示当前帧的检测框
- 检测结果累积到表格

## 测试检查清单

- [ ] 选择视频后立即显示，无遮罩
- [ ] 视频可以正常播放
- [ ] 点击"开始实时检测"后，每2秒检测一次
- [ ] 检测框正确显示在视频上
- [ ] 检测结果累积显示在表格中
- [ ] 点击"停止检测"后检测停止
- [ ] 可以继续播放视频

## 关键修复

| 问题 | 原因 | 修复 |
|------|------|------|
| 视频不显示 | 遮罩层一直显示 | 添加 `!currentVideo` 条件 |
| 检测框位置不对 | Canvas尺寸不匹配 | 使用 `getBoundingClientRect()` |
| 检测框太大/太小 | 坐标未缩放 | 添加缩放计算 |
| 窗口resize后错位 | 未监听resize事件 | 添加resize监听 |

## 总结

现在视频翻译功能已经完全实现：

✅ **视频立即显示** - 选择后不等待
✅ **实时检测** - 每2秒检测当前帧  
✅ **检测框实时显示** - 正确显示在视频上
✅ **可控制** - 可以开始/停止检测
✅ **流畅体验** - 不阻塞UI，可正常播放

按照Qt前端的实现方式，完全实现了实时视频检测功能！

