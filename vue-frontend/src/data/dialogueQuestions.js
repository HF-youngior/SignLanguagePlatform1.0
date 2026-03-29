export const dialogueQuestions = [
  {
    id: 1,
    level: '初级',
    type: '句子排序',
    scenario: '句子排序练习',
    dialogues: [
      {
        id: 1,
        oral: '我一月没有空。',
        correct: ['一月', '我', '有', '没有'],
        shuffled: ['没有', '我', '有', '一月'],
        explanation: '时间"一月"常置于句首。否定句时，先打出肯定状态的"有"，再将否定词"没有"强制置于句末，并配合摇头等否定表情。'
      }
    ]
  },
  {
    id: 2,
    level: '初级',
    type: '对话练习',
    scenario: '两位朋友在用手语语音信息沟通周末聚会安排。',
    dialogues: [
      {
        id: 1,
        oral: '这周六你有时间吗？',
        correct: ['这周六', '你', '时间', '有'],
        shuffled: ['有', '你', '这周六', '时间'],
        explanation: '时间词"这周六"置于句首，然后是主语"你"和谓语"时间有"，配合疑问表情。'
      },
      {
        id: 2,
        oral: '有空！下午三点，可以吗？',
        correct: ['有', '下午', '三点', '可以'],
        shuffled: ['可以', '三点', '下午', '有'],
        explanation: '先肯定回答"有"，然后按时间从大到小（下午→三点）排列，疑问词"可以"置末。'
      }
    ]
  }
]

export default dialogueQuestions