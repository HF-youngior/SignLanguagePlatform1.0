# 教学图片放置说明

## 📁 文件夹位置
所有教学图片请放在此文件夹中：
```
vue-frontend/src/assets/challenge/level1/teaching/
```

## 📝 文件命名规则

教学图片的文件名需要与对应的答题图片文件名对应，命名规则如下：

### 命名格式
```
{答题图片文件名（不含扩展名）}-teaching.png
```

### 具体对应关系

根据当前的四道题目，你需要准备以下四张教学图片：

| 题目 | 答题图片文件名 | 教学图片文件名 |
|------|--------------|--------------|
| **"年"** | `year-2025.png` | `year-2025-teaching.png` |
| **"星期一"** | `weekday-monday.png` | `weekday-monday-teaching.png` |
| **"二十"** | `number-20.png` | `number-20-teaching.png` |
| **"1月份"** | `month-01.png` | `month-01-teaching.png` |

## ✅ 操作步骤

1. **准备教学图片**
   - 准备四张教学图片，展示正确手语打法的清晰图示
   - 可以是连贯动作的关键帧或多步骤图示

2. **重命名图片**
   - 将图片按照上表的命名规则重命名
   - 例如：如果教学图片原名叫 `教学-年.png`，请重命名为 `year-2025-teaching.png`

3. **放入文件夹**
   - 将重命名后的四张图片拖入 `vue-frontend/src/assets/challenge/level1/teaching/` 文件夹

4. **验证**
   - 刷新页面，点击日历上的题目日期
   - 答题后会自动弹出教学窗口显示对应的教学图片

## 📌 注意事项

- ✅ 文件扩展名必须是 `.png`（也支持 `.jpg` 或 `.webp`，但建议使用 `.png`）
- ✅ 文件名必须完全匹配，包括大小写
- ✅ 如果教学图片未找到，系统会显示提示信息
- ✅ 教学图片会在用户答题（无论对错）后自动弹出

## 🎯 示例

假设你有一张展示"年"的手语教学图片：

1. 原文件名：`年-教学图.jpg`
2. 重命名为：`year-2025-teaching.png`
3. 放入：`vue-frontend/src/assets/challenge/level1/teaching/year-2025-teaching.png`

完成！系统会自动识别并显示。

