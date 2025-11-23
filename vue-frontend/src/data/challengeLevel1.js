/**
 * 第一关（篇章一：过日子）的题目配置
 *
 * 使用方法：
 * 1. 将题目所需的手语图片素材放入 `src/assets/challenge/level1/` 目录。
 *    - 建议文件命名与下方 `correct` / `distractors` 的文件名完全一致，例如 `year-2025.png`。
 *    - 图片可以是 PNG、JPG、WEBP 等浏览器支持的静态格式。
 * 2. 如果需要新增日期题目，只需在数组中追加对象，并准备对应的图片即可。
 */
export const level1QuestionBank = [
  {
    dateKey: '2025-01-01',
    displayTitle: '2025 年 1 月 1 日',
    prompt: '哪一个手语是"年"？',
    correct: 'year-2025.png',
    distractors: ['weekday-monday.png', 'number-20.png', 'month-01.png']
  },
  {
    dateKey: '2025-01-06',
    displayTitle: '2025 年 1 月 6 日（星期一）',
    prompt: '哪一个手语是"星期一"？',
    correct: 'weekday-monday.png',
    distractors: ['year-2025.png', 'number-20.png', 'month-01.png']
  },
  {
    dateKey: '2025-01-20',
    displayTitle: '2025 年 1 月 20 日',
    prompt: '哪一个手语是"二十"？',
    correct: 'number-20.png',
    distractors: ['year-2025.png', 'weekday-monday.png', 'month-01.png']
  },
  {
    dateKey: '2025-01-05',
    displayTitle: '2025 年 1 月 5 日',
    prompt: '哪一个手语是"1月份"？',
    correct: 'month-01.png',
    distractors: ['year-2025.png', 'weekday-monday.png', 'number-20.png']
  }
]

