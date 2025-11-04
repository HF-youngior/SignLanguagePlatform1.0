# 视频显示黑屏问题修复

## 问题分析

从截图看，用户选择视频后仍然显示灰色占位符，视频没有显示出来。

## 根本原因

之前使用 `FileReader.readAsDataURL()` 读取视频文件，可能有一些问题：
1. 大视频文件可能导致内存问题
2. base64编码的video标签可能有兼容性问题

## 解决方案

### 使用 URL.createObjectURL

```javascript
// 之前的方式（有问题）
const reader = new FileReader()
reader.onload = (e) => {
  currentVideo.value = e.target.result
}
reader.readAsDataURL(file)

// 新的方式（立即生效）
currentVideo.value = URL.createObjectURL(file)
```

### 关键改进

1. **立即设置URL**
   - 使用 `URL.createObjectURL(file)` 创建blob URL
   - 立即返回，不等待异步读取

2. **确保不显示遮罩**
   - 设置 `isProcessing.value = false`
   - 修改遮罩条件为 `v-if="!currentVideo && !currentImage && isProcessing"`

3. **添加调试日志**
   - 打印文件信息
   - 打印URL设置信息

## 完整修复代码

```javascript
const handleVideoUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  console.log('视频文件选择:', file.name, file.type)

  try {
    // 清空之前的显示
    currentImage.value = ''
    currentVideo.value = ''
    detectionResults.value = []
    isProcessing.value = false  // 确保不显示处理中遮罩
    
    // 保存文件引用用于实时检测
    currentVideoFile.value = file

    // 立即显示视频 - 使用URL.createObjectURL
    currentVideo.value = URL.createObjectURL(file)
    console.log('视频URL已设置:', currentVideo.value)
    
    showMessage('视频已加载，可以开始实时检测...', 'success')
    
    // 等待一个tick确保DOM更新
    await nextTick()
    
  } catch (error) {
    console.error('视频处理错误:', error)
    showMessage('视频处理失败: ' + error.message, 'error')
  }
}
```

## 测试步骤

1. 刷新页面
2. 点击"选择视频"
3. 选择视频文件
4. **应该立即看到视频**
5. 控制台应该打印：
   - `视频文件选择: xxx.mp4 video/mp4`
   - `视频URL已设置: blob:http://...`

## 如果还是黑屏

请检查浏览器控制台：
1. 是否有JavaScript错误？
2. 是否有视频加载错误？
3. URL是否已设置？

## 常见问题

### Q: 为什么使用URL.createObjectURL？
A: 这是HTML5标准的文件处理方式，比FileReader更高效、更兼容。

### Q: 内存问题怎么办？
A: 使用 `URL.revokeObjectURL()` 在组件销毁时清理。已在`onUnmounted`中添加。

### Q: 视频还是黑屏？
A: 检查：
1. 视频格式是否支持（MP4, AVI等）
2. 浏览器是否支持该格式
3. 控制台是否有错误

## 总结

- ✅ 视频立即显示
- ✅ 不显示处理中遮罩
- ✅ 使用标准API
- ✅ 添加调试信息

