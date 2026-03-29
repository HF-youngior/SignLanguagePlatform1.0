<template>
  <div class="min-h-screen animated-gradient">
    <nav class="backdrop-blur-md bg-white/70 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <router-link
              to="/home"
              class="flex items-center text-2xl font-bold text-blue-700 hover:text-blue-800 hover:scale-105 transition-all duration-300"
            >
              <!-- 使用已有的默认头像图片代替缺失的 logo 文件，避免 Vite 解析错误 -->
              <img src="/logo-zhangzhongyu.svg" alt="掌中语 Logo" class="w-10 h-10 mr-3 rounded-full" />
              <span>掌中语-手语小镇</span>
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/learn" class="nav-link text-blue-700 font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500 after:rounded-full">学堂</router-link>
            <router-link to="/translate" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">译站</router-link>
            <router-link to="/community" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">手语圈</router-link>
          </div>
        </div>
      </div>
    </nav>

    <main class="pt-10 pb-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <section class="calendar-banner fade-in">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div class="flex items-center gap-5">
              <div class="banner-icon">📅</div>
              <div>
                <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">第一关：过日子之数字日期</h1>
                <p class="text-base md:text-lg text-white/85">把数字和日期编进生活日常，每天的日历都是一次手语练习。</p>
              </div>
            </div>
            <router-link to="/learn/challenge" class="el-button el-button--primary el-button--round el-button--large" style="position: relative; z-index: 10;">
              返回闯关地图
            </router-link>
          </div>
          <div class="calendar-banner__hand" aria-hidden="true"></div>
        </section>

        <section class="calendar-info-card fade-in">
          <div class="info-left">
            <h2 class="text-2xl font-semibold text-slate-900 mb-3">关卡信息</h2>
            <p class="text-slate-600 leading-relaxed">
              当前篇章围绕生活中的日期与数字，从打招呼约时间、安排日程，到节日纪念。把2026年的每一天都变成手语练习的契机。
            </p>
            <div class="milestone-progress">
              <div class="milestone-progress__bar">
                <div class="milestone-progress__fill" :style="{ width: `${progressPercent}%` }"></div>
              </div>
              <div class="milestone-progress__label">已完成 {{ progressPercent }}% 的日历任务</div>
            </div>
          </div>
          <div class="info-right">
            <ul>
              <li><span>📌 目标：</span>完成 {{ totalDates }} 道题目</li>
              <li><span>🎯 进度：</span>{{ validCompletedDates.length }} / {{ totalDates }} 已完成</li>
              <li><span>✨ 小提示：</span>点击日历上<strong class="text-indigo-600">白色光点</strong>的日期答题，正确完成即可点亮该日期。</li>
              <li><span>🏆 成就：</span>完成所有题目将获得特别鼓励提示</li>
            </ul>
            <div v-if="isAllCompleted" class="review-lesson-button-container">
              <el-button 
                type="primary" 
                round 
                @click="openGrammarBagDialog"
                class="review-lesson-button"
              >
                📚 复习锦囊
              </el-button>
              <el-button 
                type="success" 
                round 
                @click="startSentenceSortExercise"
                class="review-lesson-button"
              >
                🔤 语序练习
              </el-button>
            </div>
          </div>
        </section>

        <section class="calendar-panel fade-in">
          <div class="calendar-panel__header">
            <div class="year-display">
              <button class="year-button" disabled>2026</button>
              <span>数字日期练习</span>
            </div>
            <div class="month-selector">
              <button
                v-for="(month, index) in months"
                :key="month.value"
                :class="[
                  'month-button', 
                  { 
                    active: currentMonthIndex === index,
                    'has-uncompleted-questions': hasUncompletedQuestionsInMonth(index),
                    'has-questions': hasQuestionsInMonth(index)
                  }
                ]"
                @click="currentMonthIndex = index"
              >
                {{ month.label }}
                <span v-if="hasUncompletedQuestionsInMonth(index)" class="month-marker"></span>
              </button>
            </div>
          </div>

          <div class="calendar-grid">
            <div class="calendar-weekday" v-for="weekday in weekdays" :key="weekday">
              {{ weekday }}
            </div>
            <div
              v-for="blank in monthLeadingBlanks"
              :key="'blank-' + blank"
              class="calendar-day calendar-day--empty"
            ></div>
            <div
              v-for="day in currentMonthDays"
              :key="day"
              class="calendar-day"
              :class="{
                'is-today': isToday(day),
                'is-completed': isDateCompleted(day),
                'has-question': hasQuestion(day),
                'is-available': hasQuestion(day) && !isDateCompleted(day)
              }"
              @click="handleDateClick(day)"
            >
              <span class="day-number">{{ day }}</span>
              <span v-if="hasQuestion(day)" class="day-marker" :class="{ 'pulse-animation': !isDateCompleted(day) }">
                <span class="marker-glow"></span>
              </span>
              <div v-if="hasQuestion(day) && !isDateCompleted(day)" class="question-hint">点击答题</div>
            </div>
          </div>
        </section>

        <el-dialog
          v-model="quizDialogVisible"
          width="560px"
          align-center
          class="quiz-dialog"
          :show-close="false"
          :before-close="handleQuizClose"
          :close-on-click-modal="false"
          :close-on-press-escape="false"
        >
          <template #header>
            <div class="quiz-dialog__header" v-if="quizQuestion">
              <div>
                <div class="quiz-dialog__title">{{ quizQuestion.displayTitle || quizQuestion.dateLabel }}</div>
                <div class="quiz-dialog__subtitle">篇章一 · 过日子</div>
              </div>
              <button class="quiz-dialog__close" @click="closeQuiz">
                <span aria-hidden="true">×</span>
              </button>
            </div>
          </template>

          <div v-if="quizQuestion" class="quiz-dialog__body">
            <p class="quiz-dialog__question">{{ quizQuestion.prompt }}</p>
            <div class="quiz-options">
              <button
                v-for="option in quizOptions"
                :key="option.key"
                type="button"
                class="quiz-option"
                :class="[`state-${option.state}`]"
                @click="selectOption(option)"
              >
                <img :src="option.imageUrl" :alt="option.key" />
                <div class="quiz-option__status" v-if="option.state === 'correct'">✔ 正确</div>
                <div class="quiz-option__status" v-else-if="option.state === 'incorrect'">✖ 再试试</div>
              </button>
            </div>
          </div>
        </el-dialog>

        <el-dialog
        v-model="teachingDialogVisible"
        width="480px"
        align-center
        class="teaching-dialog"
        :show-close="false"
      >
        <template #header>
          <div class="teaching-dialog__header">
            <div>
              <div class="teaching-dialog__title">正确打法</div>
              <div class="teaching-dialog__subtitle" v-if="lastQuestion">
                {{ lastQuestion.displayTitle }} · {{ lastQuestion.prompt }}
              </div>
            </div>
            <button class="teaching-dialog__close" @click="closeTeachingDialog">
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </template>
        <div class="teaching-dialog__body" v-if="teachingImageSrc">
          <img :src="teachingImageSrc" alt="正确打法教学图" />
        </div>
        <div class="teaching-dialog__footer">
          <el-button type="primary" round @click="closeTeachingDialog">下一题</el-button>
        </div>
      </el-dialog>

      <!-- 语法锦囊对话框 -->
      <el-dialog
        v-model="grammarBagDialogVisible"
        width="600px"
        align-center
        class="grammar-bag-dialog"
        :show-close="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
      >
        <template #header>
          <div class="grammar-bag-dialog__header">
            <div>
              <div class="grammar-bag-dialog__title">🎒 手语语法学习锦囊1</div>
              <div class="grammar-bag-dialog__subtitle">数字与日历篇</div>
            </div>
            <button class="grammar-bag-dialog__close" @click="closeGrammarBagDialog">
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </template>
        <div class="grammar-bag-dialog__body">
          <div class="grammar-bag__content">
            <h3 class="grammar-bag__title">⭐ 核心规则：时间词句首</h3>
            <div class="grammar-bag__section">
              <h4 class="grammar-bag__subtitle">📍 规则说明</h4>
              <p class="grammar-bag__text">手语中，先表述时间，再表述主体。</p>
              <p class="grammar-bag__text">否定句中否定词放置在最后。</p>
            </div>
            <div class="grammar-bag__section">
              <h4 class="grammar-bag__subtitle">💡 为什么这样？</h4>
              <p class="grammar-bag__text">手语是视觉语言，先建立时间背景，再传达核心信息，让对方第一时间知道 "什么时候"。</p>
            </div>
            <div class="grammar-bag__section">
              <h4 class="grammar-bag__subtitle">📝 规则对比</h4>
              <table class="grammar-bag__table">
                <thead>
                  <tr>
                    <th>场景</th>
                    <th>口语表达</th>
                    <th>手语表达</th>
                    <th>差异</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>今天</td>
                    <td>我今天去学校</td>
                    <td>今天我去学校</td>
                    <td>时间词移到句首</td>
                  </tr>
                  <tr>
                    <td>明天</td>
                    <td>我明天买苹果</td>
                    <td>明天我买苹果</td>
                    <td>时间词移到句首</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="grammar-bag__section">
              <h4 class="grammar-bag__subtitle">🔍 练习要点</h4>
              <ul class="grammar-bag__list">
                <li>看到句子先找时间词和否定词</li>
                <li>把时间词提到最前面，否定词置最后</li>
              </ul>
            </div>
            <div class="grammar-bag__section">
              <h4 class="grammar-bag__subtitle">💭 记忆口诀</h4>
              <p class="grammar-bag__text">时间词，放句首，<br>先说时间后说事。<br>记得最后才说不。</p>
            </div>
          </div>
        </div>
        <div class="grammar-bag-dialog__footer">
          <el-button @click="saveGrammarToBag">保存到锦囊</el-button>
          <el-button type="primary" round @click="closeGrammarBagDialog">开始练习</el-button>
        </div>
      </el-dialog>

      <!-- 句子排序练习对话框 -->
      <el-dialog
        v-model="sentenceSortDialogVisible"
        width="600px"
        align-center
        class="sentence-sort-dialog"
        :show-close="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
      >
        <template #header>
          <div class="sentence-sort-dialog__header">
            <div>
              <div class="sentence-sort-dialog__title">句子排序练习</div>
              <div class="sentence-sort-dialog__subtitle" v-if="currentSentenceSortQuestion">
                {{ currentSentenceSortQuestion.level }} · {{ currentSentenceSortQuestion.prompt }}
              </div>
            </div>
            <button class="sentence-sort-dialog__close" @click="closeSentenceSortDialog">
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </template>
        <div class="sentence-sort-dialog__body" v-if="currentSentenceSortQuestion">
          <div class="sentence-sort__prompt">
            <p class="sentence-sort__prompt-text">口语：{{ currentSentenceSortQuestion.oral }}</p>
            <p class="sentence-sort__prompt-text">请按手语语序排列：</p>
          </div>
          <div class="sentence-sort__drag-area">
            <div 
              v-for="(word, index) in shuffledWords" 
              :key="index"
              class="sentence-sort__word"
              draggable="true"
              @dragstart="onDragStart($event, word)"
              @dragover.prevent
              @drop="onDrop($event, index)"
            >
              {{ word }}
            </div>
          </div>
          <div class="sentence-sort__drop-area">
            <p class="sentence-sort__drop-label">你的答案：</p>
            <div class="sentence-sort__drop-line"
               @dragover.prevent
               @drop="onDrop($event, 0, false, -1)">
              <div 
                v-for="(word, index) in userAnswer" 
                :key="index"
                class="sentence-sort__drop-item"
                draggable="true"
                @dragstart="onDragStart($event, word, true, index)"
                @dragover.prevent
                @drop="onDrop($event, 0, true, index)"
              >
                {{ word }}
                <button class="sentence-sort__remove-item" @click="removeItem(index)">
                  ×
                </button>
              </div>
              <div 
                class="sentence-sort__drop-placeholder"
                v-if="userAnswer.length === 0"
              >
                请从上方拖动词语到这里
              </div>
            </div>
          </div>
        </div>
        <div class="sentence-sort-dialog__footer">
          <el-button @click="resetSentenceSort">重置</el-button>
          <el-button type="primary" round @click="checkSentenceSortAnswer" :disabled="userAnswer.length !== currentSentenceSortQuestion?.correct.length">
            提交答案
          </el-button>
        </div>
      </el-dialog>

      <!-- 对话练习对话框 -->
      <el-dialog
        v-model="dialogueDialogVisible"
        width="800px"
        align-center
        class="dialogue-dialog"
        :show-close="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
      >
        <template #header>
          <div class="dialogue-dialog__header">
            <div>
              <div class="dialogue-dialog__title">对话练习</div>
              <div class="dialogue-dialog__subtitle" v-if="currentDialogueQuestion">
                {{ currentDialogueQuestion.level }} · {{ currentDialogueQuestion.scenario }}
              </div>
            </div>
            <button class="dialogue-dialog__close" @click="closeDialogueDialog">
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </template>
        <div class="dialogue-dialog__body" v-if="currentDialogueQuestion">
          <div class="dialogue__scenario">
            <p class="dialogue__scenario-text">{{ currentDialogueQuestion.scenario }}</p>
          </div>
          <div class="dialogue__content">
            <div class="dialogue__item" v-for="(dialogue, index) in currentDialogueQuestion.dialogues" :key="index">
              <div class="dialogue__item-header">
                <h3 class="dialogue__item-title">第 {{ index + 1 }} 句</h3>
                <p class="dialogue__item-oral">口语：{{ dialogue.oral }}</p>
              </div>
              <div class="dialogue__item-drag-area">
                <div 
                  v-for="(word, wordIndex) in getShuffledDialogueWords(index)" 
                  :key="wordIndex"
                  class="dialogue__word"
                  draggable="true"
                  @dragstart="onDialogueDragStart($event, word, index)"
                  @dragover.prevent
                >
                  {{ word }}
                </div>
              </div>
              <div class="dialogue__item-drop-area">
                <h4 class="dialogue__item-drop-label">手语语序：</h4>
                <div 
                  class="dialogue__item-drop-line" 
                  @dragover.prevent 
                  @drop="onDialogueDrop($event, -1, index)"
                >
                  <template v-if="!dialogueUserAnswers[index] || dialogueUserAnswers[index].length === 0">
                    <span class="dialogue__item-drop-placeholder">请将上方词语拖放到此处</span>
                  </template>
                  <template v-else>
                    <div
                      v-for="(answerWord, answerIndex) in dialogueUserAnswers[index]"
                      :key="answerIndex"
                      class="dialogue__item-drop-item"
                      draggable="true"
                      @dragstart="onDialogueDragStart($event, answerWord, index)"
                      @dragover.prevent
                      @drop="onDialogueDrop($event, answerIndex, index)"
                    >
                      {{ answerWord }}
                      <button 
                        class="dialogue__item-remove-item"
                        @click="removeDialogueItem(index, answerIndex)"
                      >
                        ×
                      </button>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="dialogue-dialog__footer">
          <el-button @click="resetDialogue" class="reset-button">重置</el-button>
          <el-button type="primary" round @click="checkDialogueAnswer" :disabled="!isDialogueAnswerComplete" class="submit-button">
            提交答案
          </el-button>
        </div>
      </el-dialog>

        <el-dialog
          v-model="lessonDialogVisible"
          width="600px"
          align-center
          class="lesson-dialog"
          :show-close="false"
        >
          <template #header>
            <div class="lesson-dialog__header">
              <div class="lesson-dialog__title">🎯 小课堂｜用手语"说"出年月日</div>
              <button class="lesson-dialog__close" @click="closeLessonDialog">
                <span aria-hidden="true">×</span>
              </button>
            </div>
          </template>

          <div class="lesson-dialog__body">
            <p class="lesson-dialog__content">
              恭喜你学会了手语数字！现在，我们现在来总结一下如何用手语表达日期。
            </p>
            <div class="lesson-section">
              <h3 class="lesson-section__title">📅 年​份</h3>
              <p class="lesson-section__content">
                右手食指从左拳关节（象征四季）向下划——一年就这样"划"出来啦。想表示几年右手就摆数字几。
              </p>
            </div>
            <div class="lesson-section">
              <h3 class="lesson-section__title">🌙 月​份</h3>
              <p class="lesson-section__content">
                左手食指横伸，手背向外，右手食指指尖沿左手下向左一撇，模拟"月"字的第一个笔画。要表达几个月，左手就摆数字几。
              </p>
            </div>
            <div class="lesson-section">
              <h3 class="lesson-section__title">☀️ 日期</h3>
              <p class="lesson-section__content">
                左手在上表月份（比数字），右手在下列日期（比数字），比如左手"6"+右手"8"，就是 6月8日。
              </p>
            </div>
            <div class="lesson-section">
              <h3 class="lesson-section__title">💡 试试看</h3>
              <p class="lesson-section__content">
                用你学到的数字，搭配上面的手势和位置规则，就能组合出任意日期啦！快去日历里挑几个日子，用手语"说"出来吧～✋💬
              </p>
            </div>
          </div>

          <template #footer>
            <div class="lesson-dialog__footer">
              <button v-if="!lessonSavedToBag" class="lesson-dialog__button save-button" @click="saveToBag">
                💼 保存到锦囊
              </button>
              <button class="lesson-dialog__button" @click="closeLessonDialog">
                {{ lessonSavedToBag ? '关闭' : '我知道了' }}
              </button>
            </div>
          </template>
        </el-dialog>
      </div>
    </main>
  </div>
</template>

<script>
import { ElMessageBox, ElMessage } from 'element-plus'
import { level1QuestionBank } from '@/data/challengeLevel1'
import { sentenceSortQuestions } from '@/data/sentenceSortQuestions'
import { dialogueQuestions } from '@/data/dialogueQuestions'

const STORAGE_KEYS = {
  completedDates: 'challengeLevel1Dates',
  milestones: 'challengeLevel1Milestones',
  completedLevels: 'challengeCompletedLevels'
}

const challengeImageModules = import.meta.glob('../assets/challenge/level1/**/*.{png,jpg,jpeg,svg,webp,gif}', {
  eager: true,
  import: 'default'
})

const challengeImageMap = Object.fromEntries(
  Object.entries(challengeImageModules).map(([path, module]) => {
    const segments = path.split('/')
    const filename = segments[segments.length - 1]
    return [filename, module]
  })
)

const teachingImageModules = import.meta.glob('../assets/challenge/level1/teaching/**/*.{png,jpg,jpeg,svg,webp,gif}', {
  eager: true,
  import: 'default'
})

const teachingImageMap = Object.fromEntries(
  Object.entries(teachingImageModules).map(([path, module]) => {
    const segments = path.split('/')
    const filename = segments[segments.length - 1]
    return [filename, module]
  })
)

export default {
  name: 'ChallengeLevelCalendar',
  data() {
    return {
      currentMonthIndex: new Date().getMonth(),
      months: Array.from({ length: 12 }).map((_, idx) => ({
        value: idx,
        label: `${idx + 1}月`,
        days: new Date(2026, idx + 1, 0).getDate()
      })),
      weekdays: ['日', '一', '二', '三', '四', '五', '六'],
      completedDates: new Set(),
      milestoneFlags: {
        50: false,
        80: false,
        100: false
      },
      questionMap: level1QuestionBank.reduce((acc, item) => {
        acc[item.dateKey] = item
        return acc
      }, {}),
      quizDialogVisible: false,
      quizDateKey: null,
      quizQuestion: null,
      quizOptions: [],
      quizSelectedKey: null,
      quizClosingTimer: null,
      teachingDialogVisible: false,
      teachingImageSrc: null,
      lastQuestion: null,
      lessonDialogVisible: false,
      lessonSavedToBag: false,
      // 语法锦囊对话框
      grammarBagDialogVisible: false,
      // 句子排序练习
      sentenceSortDialogVisible: false,
      currentSentenceSortQuestion: null,
      shuffledWords: [],
      userAnswer: [],
      draggedWord: null,
      isFromAnswer: false,
      answerIndex: -1,
      // 对话练习
      dialogueDialogVisible: false,
      currentDialogueQuestion: null,
      currentDialogueIndex: 0,
      dialogueUserAnswers: [],
      dialogueDraggedWord: null,
      dialogueDraggedIndex: null
    }
  },
  computed: {
    currentMonthDays() {
      return this.months[this.currentMonthIndex].days
    },
    monthLeadingBlanks() {
      const firstDay = new Date(2026, this.currentMonthIndex, 1).getDay()
      return Array.from({ length: firstDay }, (_, idx) => idx)
    },
    validCompletedDates() {
      // 只计算当前questionMap中存在的已完成题目
      return Array.from(this.completedDates).filter(dateKey => this.questionMap[dateKey])
    },
    progressPercent() {
      return Math.round((this.validCompletedDates.length / this.totalDates) * 100)
    },
    totalDates() {
      // 只计算题目数量，不是所有日期
      return Object.keys(this.questionMap).length
    },
    isAllCompleted() {
      return this.validCompletedDates.length >= this.totalDates
    }
  },
  methods: {
    hasQuestionsInMonth(monthIndex) {
      // 检查指定月份是否有题目
      const month = String(monthIndex + 1).padStart(2, '0')
      return Object.keys(this.questionMap).some(dateKey => {
        return dateKey.startsWith(`2026-${month}-`)
      })
    },
    hasUncompletedQuestionsInMonth(monthIndex) {
      // 检查指定月份是否有未完成的题目
      const month = String(monthIndex + 1).padStart(2, '0')
      return Object.keys(this.questionMap).some(dateKey => {
        return dateKey.startsWith(`2026-${month}-`) && !this.completedDates.has(dateKey)
      })
    },
    addTodayTomorrowYesterdayQuestions() {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dayAfterTomorrow = new Date(tomorrow)
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

      // 生成今天、明天、后天的日期键
      const todayKey = this.getDateKeyFromDate(today)
      const tomorrowKey = this.getDateKeyFromDate(tomorrow)
      const dayAfterTomorrowKey = this.getDateKeyFromDate(dayAfterTomorrow)

      // 添加今天的题目
      if (!this.questionMap[todayKey]) {
        this.questionMap[todayKey] = {
          dateKey: todayKey,
          displayTitle: `${today.getFullYear()} 年 ${today.getMonth() + 1} 月 ${today.getDate()} 日（今天）`,
          prompt: '哪一个手语是"今天"？',
          correct: 'today.png',
          distractors: ['tomorrow.png', 'weekday-monday.png', 'year-2025.png']
        }
      }

      // 添加明天的题目
      if (!this.questionMap[tomorrowKey]) {
        this.questionMap[tomorrowKey] = {
          dateKey: tomorrowKey,
          displayTitle: `${tomorrow.getFullYear()} 年 ${tomorrow.getMonth() + 1} 月 ${tomorrow.getDate()} 日（明天）`,
          prompt: '哪一个手语是"明天"？',
          correct: 'tomorrow.png',
          distractors: ['today.png', 'weekday-monday.png', 'year-2026.png']
        }
      }

      // 添加后天的题目
      if (!this.questionMap[dayAfterTomorrowKey]) {
        this.questionMap[dayAfterTomorrowKey] = {
          dateKey: dayAfterTomorrowKey,
          displayTitle: `${dayAfterTomorrow.getFullYear()} 年 ${dayAfterTomorrow.getMonth() + 1} 月 ${dayAfterTomorrow.getDate()} 日（后天）`,
          prompt: '哪一个手语是"后天"？',
          correct: 'day_after_tomorrow.png',
          distractors: ['today.png', 'tomorrow.png', 'weekday-monday.png']
        }
      }
    },
    getDateKeyFromDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    getDateKey(day) {
      const month = String(this.currentMonthIndex + 1).padStart(2, '0')
      const date = String(day).padStart(2, '0')
      return `2026-${month}-${date}`
    },
    isDateCompleted(day) {
      return this.completedDates.has(this.getDateKey(day))
    },
    hasQuestion(day) {
      const dateKey = this.getDateKey(day)
      return !!this.questionMap[dateKey]
    },
    handleDateClick(day) {
      const dateKey = this.getDateKey(day)
      const question = this.questionMap[dateKey]
      if (!question) {
        ElMessage({
          message: '该日期暂无题目，请点击带有白色光点的日期进行答题学习！',
          type: 'info',
          duration: 3000
        })
        return
      }
      this.prepareQuiz(dateKey, question)
    },
    prepareQuiz(dateKey, question) {
      const optionFiles = [question.correct, ...(question.distractors || [])]
      const uniqueOptionFiles = Array.from(new Set(optionFiles))

      if (uniqueOptionFiles.length < 4) {
        ElMessageBox.alert(
          '该题目的选项数量不足 4 个，请在数据文件中补充至少 3 个干扰项。',
          '题目配置不完整',
          { confirmButtonText: '好的' }
        )
        return
      }

      const missingFiles = uniqueOptionFiles.filter((file) => !challengeImageMap[file])
      if (missingFiles.length) {
        ElMessageBox.alert(
          `尚未找到以下图片资源：\n${missingFiles.join(
            '\n'
          )}\n\n请将对应图片放入 src/assets/challenge/level1/ 目录下，并保持文件名一致。`,
          '请完善图片素材',
          { confirmButtonText: '我这就补齐' }
        )
        return
      }

      const allOptions = uniqueOptionFiles.map((file) => ({
        key: file,
        imageUrl: challengeImageMap[file],
        isCorrect: file === question.correct,
        state: 'default'
      }))

      this.quizOptions = this.shuffleOptions(allOptions).slice(0, 4)
      this.quizDialogVisible = true
      this.quizDateKey = dateKey
      this.quizQuestion = question
      this.quizSelectedKey = null
      this.lastQuestion = question
    },
    shuffleOptions(options) {
      const arr = [...options]
      for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return arr
    },
    selectOption(option) {
      if (this.quizSelectedKey) return
      this.quizSelectedKey = option.key

      this.quizOptions = this.quizOptions.map((opt) => {
        if (opt.key === option.key) {
          return {
            ...opt,
            state: option.isCorrect ? 'correct' : 'incorrect'
          }
        }
        if (opt.isCorrect) {
          return {
            ...opt,
            state: 'correct'
          }
        }
        return { ...opt, state: 'default' }
      })

      if (option.isCorrect) {
        this.markDateCompleted(this.quizDateKey)
      }

      this.quizClosingTimer = setTimeout(() => {
        this.closeQuiz(true)
      }, 1200)
    },
    closeQuiz(showTeaching = false) {
      if (this.quizClosingTimer) {
        clearTimeout(this.quizClosingTimer)
        this.quizClosingTimer = null
      }
      const finishedQuestion = this.quizQuestion
      this.quizDialogVisible = false
      this.quizDateKey = null
      this.quizQuestion = null
      this.quizOptions = []
      this.quizSelectedKey = null
      if (showTeaching && finishedQuestion) {
        this.showTeachingDiagram(finishedQuestion)
      }
    },
    cleanupQuizState() {
      if (this.quizClosingTimer) {
        clearTimeout(this.quizClosingTimer)
        this.quizClosingTimer = null
      }
      this.quizDateKey = null
      this.quizQuestion = null
      this.quizOptions = []
      this.quizSelectedKey = null
    },
    handleQuizClose(done) {
      this.cleanupQuizState()
      this.quizDialogVisible = false
      if (typeof done === 'function') {
        done()
      }
    },
    markDateCompleted(dateKey) {
      if (!this.completedDates.has(dateKey)) {
        const updated = new Set(this.completedDates)
        updated.add(dateKey)
        this.completedDates = updated
        this.persistProgress()
        this.checkMilestones()
        
        // 检查是否所有日期题目都已完成
        if (this.validCompletedDates.length >= this.totalDates) {
          // 所有题目完成后显示语法锦囊
          setTimeout(() => {
            this.openGrammarBagDialog()
          }, 1000)
        }
      }
    },
    isToday(day) {
      const today = new Date()
      return today.getFullYear() === 2026 && today.getMonth() === this.currentMonthIndex && today.getDate() === day
    },
    persistProgress() {
      localStorage.setItem(STORAGE_KEYS.completedDates, JSON.stringify(Array.from(this.completedDates)))
      localStorage.setItem(STORAGE_KEYS.milestones, JSON.stringify(this.milestoneFlags))
    },
    restoreProgress() {
      const storedDates = JSON.parse(localStorage.getItem(STORAGE_KEYS.completedDates) || '[]')
      this.completedDates = new Set(storedDates)
      const storedMilestones = JSON.parse(localStorage.getItem(STORAGE_KEYS.milestones) || '{}')
      this.milestoneFlags = { ...this.milestoneFlags, ...storedMilestones }
    },
    checkMilestones() {
      const milestones = [25, 50, 75, 100]
      milestones.forEach((milestone) => {
        if (this.progressPercent >= milestone && !this.milestoneFlags[milestone]) {
          this.milestoneFlags[milestone] = true
          if (milestone === 100) {
            this.showLessonDialog()
            this.markLevelCompleted()
          } else {
            this.showMilestoneDialog(milestone)
          }
        }
      })
      this.persistProgress()
    },
    showMilestoneDialog(percent) {
      const messages = {
        25: '很棒！完成了第一题，闯关旅程正式启程啦！',
        50: '已经完成一半，继续保持，马上完成所有题目！',
        75: '离终点只差一步，冲刺一下就能掌握所有内容！'
      }
      
      ElMessageBox.alert(
        messages[percent],
        '🎉 闯关进度',
        {
          confirmButtonText: '继续加油',
          type: 'success',
          customClass: 'milestone-dialog',
          center: true
        }
      )
    },
    showLessonDialog() {
      this.lessonDialogVisible = true
      this.lessonSavedToBag = this.isLessonSaved()
    },
    isLessonSaved() {
      return localStorage.getItem('lessonSavedToBag') === 'true'
    },
    closeLessonDialog() {
      this.lessonDialogVisible = false
    },
    saveToBag() {
      localStorage.setItem('lessonSavedToBag', 'true')
      this.lessonSavedToBag = true
      ElMessage({
        message: '已保存到锦囊',
        type: 'success',
        duration: 2000
      })
    },
    saveGrammarToBag() {
      localStorage.setItem('grammarBagSaved', 'true')
      ElMessage({
        message: '语法锦囊已保存到我的锦囊',
        type: 'success',
        duration: 2000
      })
      // 关闭语法锦囊对话框
      this.grammarBagDialogVisible = false
      // 继续执行句子排序练习
      const randomIndex = Math.floor(Math.random() * sentenceSortQuestions.length)
      this.currentSentenceSortQuestion = sentenceSortQuestions[randomIndex]
      // 打乱单词顺序
      this.shuffledWords = this.shuffleArray([...this.currentSentenceSortQuestion.correct])
      // 重置用户答案
      this.userAnswer = []
      this.sentenceSortDialogVisible = true
    },
    markLevelCompleted() {
      const storedCompleted = Number(localStorage.getItem(STORAGE_KEYS.completedLevels) || 0)
      if (storedCompleted < 1) {
        localStorage.setItem(STORAGE_KEYS.completedLevels, '1')
        // 延迟2秒后再显示完成提示，确保在小课堂对话框显示后再显示
        setTimeout(() => {
          this.$nextTick(() => {
            window.dispatchEvent(new CustomEvent('challenge-progress-changed'))
            ElMessage({
              message: '篇章一完成！闯关地图已为你点亮新的篇章入口。',
              type: 'success',
              duration: 5000
            })
          })
        }, 2000)
      }
    },
    showTeachingDiagram(question) {
      if (!question || !question.correct) return
      
      // 根据正确答案文件名生成教学图片文件名
      // 例如：year-2025.png -> year-2025-teaching.png
      const correctFileName = question.correct
      const baseName = correctFileName.replace('.png', '').replace('.jpg', '').replace('.webp', '')
      const teachingFileName = `${baseName}-teaching.png`
      
      // 尝试加载教学图片
      const teachingImage = teachingImageMap[teachingFileName]
      
      if (teachingImage) {
        this.teachingImageSrc = teachingImage
        this.lastQuestion = question
        this.teachingDialogVisible = true
      } else {
        // 如果找不到教学图片，给出提示
        ElMessage({
          message: '教学图片暂未准备，敬请期待！',
          type: 'info',
          duration: 2000
        })
      }
    },
    closeTeachingDialog() {
      this.teachingDialogVisible = false
      this.teachingImageSrc = null
      this.lastQuestion = null
      
      // 检查是否所有题目都已完成
      this.$nextTick(() => {
        if (this.isAllCompleted && !this.milestoneFlags[100]) {
          // 延迟两秒后显示完成提示和锦囊
          setTimeout(() => {
            // 如果全部完成但还没有显示100%提示，先提示用户完成情况，然后再显示锦囊
            ElMessageBox.alert(
              '恭喜你完成了所有题目！现在可以查看锦囊总结了。',
              '🎉 闯关完成',
              {
                confirmButtonText: '查看锦囊',
                type: 'success',
                customClass: 'milestone-dialog',
                center: true,
                callback: (action) => {
                  if (action === 'confirm') {
                    // 延迟1秒后再显示小课堂对话框，避免与当前对话框重叠
                    setTimeout(() => {
                      this.checkMilestones()
                    }, 1000)
                  }
                }
              }
            )
          }, 2000)
        }
      })
    },
    // 语法锦囊相关方法
    openGrammarBagDialog() {
      this.grammarBagDialogVisible = true
    },
    closeGrammarBagDialog() {
      this.grammarBagDialogVisible = false
    },
    // 句子排序练习相关方法
    startSentenceSortExercise() {
      // 检查用户是否已保存语法锦囊
      const isGrammarBagSaved = localStorage.getItem('grammarBagSaved') === 'true'
      if (!isGrammarBagSaved) {
        // 如果没有保存，先显示语法锦囊
        this.grammarBagDialogVisible = true
        // 保存后会在closeGrammarBagDialog方法中继续执行练习
      } else {
        // 随机选择一个句子排序题目
        const randomIndex = Math.floor(Math.random() * sentenceSortQuestions.length)
        this.currentSentenceSortQuestion = sentenceSortQuestions[randomIndex]
        // 打乱单词顺序
        this.shuffledWords = this.shuffleArray([...this.currentSentenceSortQuestion.correct])
        // 重置用户答案
        this.userAnswer = []
        this.sentenceSortDialogVisible = true
      }
    },
    onDragStart(event, word, isFromAnswer = false, answerIndex = -1) {
      this.draggedWord = word
      this.isFromAnswer = isFromAnswer
      this.answerIndex = answerIndex
      event.dataTransfer.effectAllowed = 'move'
    },
    onDrop(event, index, isAnswerDrop = false, answerDropIndex = -1) {
      event.preventDefault()
      if (this.draggedWord) {
        if (this.isFromAnswer) {
          // 从答案中移除单词
          if (this.answerIndex > -1) {
            this.userAnswer.splice(this.answerIndex, 1)
          }
          // 将单词添加到答案的指定位置
          if (isAnswerDrop && answerDropIndex > -1) {
            this.userAnswer.splice(answerDropIndex, 0, this.draggedWord)
          } else {
            // 如果不是答案区域，将单词添加回打乱的单词中
            this.shuffledWords.push(this.draggedWord)
          }
        } else {
          // 从打乱的单词中移除被拖动的单词
          const draggedIndex = this.shuffledWords.indexOf(this.draggedWord)
          if (draggedIndex > -1) {
            this.shuffledWords.splice(draggedIndex, 1)
            // 将单词添加到答案的指定位置
            if (isAnswerDrop && answerDropIndex > -1) {
              this.userAnswer.splice(answerDropIndex, 0, this.draggedWord)
            } else {
              this.userAnswer.push(this.draggedWord)
            }
          }
        }
        this.draggedWord = null
        this.isFromAnswer = false
        this.answerIndex = -1
      }
    },
    removeItem(index) {
      if (index > -1 && index < this.userAnswer.length) {
        const word = this.userAnswer[index]
        this.userAnswer.splice(index, 1)
        this.shuffledWords.push(word)
      }
    },
    resetSentenceSort() {
      if (this.currentSentenceSortQuestion) {
        this.shuffledWords = this.shuffleArray([...this.currentSentenceSortQuestion.correct])
        this.userAnswer = []
      }
    },
    checkSentenceSortAnswer() {
      if (!this.currentSentenceSortQuestion) return
      
      const isCorrect = JSON.stringify(this.userAnswer) === JSON.stringify(this.currentSentenceSortQuestion.correct)
      
      if (isCorrect) {
        ElMessage({
          message: '回答正确！',
          type: 'success',
          duration: 2000
        })
        // 延迟关闭对话框并打开下一个练习
        setTimeout(() => {
          this.closeSentenceSortDialog()
          this.startDialogueExercise()
        }, 1000)
      } else {
        ElMessage({
          message: '回答错误，请再试一次！',
          type: 'error',
          duration: 2000
        })
      }
    },
    closeSentenceSortDialog() {
      this.sentenceSortDialogVisible = false
      this.currentSentenceSortQuestion = null
      this.shuffledWords = []
      this.userAnswer = []
      this.draggedWord = null
    },
    // 对话练习相关方法
    startDialogueExercise() {
      // 按顺序选择题目，从第一个开始
      this.currentDialogueIndex = 0
      this.currentDialogueQuestion = dialogueQuestions[this.currentDialogueIndex]
      // 重置用户答案
      this.dialogueUserAnswers = this.currentDialogueQuestion.dialogues.map(() => [])
      this.dialogueDialogVisible = true
    },
    getShuffledDialogueWords(dialogueIndex) {
      if (!this.currentDialogueQuestion) return []
      const dialogue = this.currentDialogueQuestion.dialogues[dialogueIndex]
      // 获取当前答案中已有的单词
      const answeredWords = this.dialogueUserAnswers[dialogueIndex] || []
      // 过滤掉已在答案中的单词
      const remainingWords = dialogue.shuffled.filter(word => !answeredWords.includes(word))
      return this.shuffleArray([...remainingWords])
    },
    onDialogueDragStart(event, word, dialogueIndex) {
      this.dialogueDraggedWord = word
      this.dialogueDraggedIndex = dialogueIndex
      event.dataTransfer.effectAllowed = 'move'
    },
    onDialogueDrop(event, answerDropIndex, dialogueIndex) {
      event.preventDefault()
      if (this.dialogueDraggedWord && this.dialogueDraggedIndex === dialogueIndex) {
        // 确保 dialogueUserAnswers 数组已初始化
        if (!this.dialogueUserAnswers[dialogueIndex]) {
          this.dialogueUserAnswers[dialogueIndex] = []
        }
        
        // 检查单词是否已经在答案中
        const answerIndex = this.dialogueUserAnswers[dialogueIndex].indexOf(this.dialogueDraggedWord)
        
        if (answerIndex > -1) {
          // 如果单词已经在答案中，且是在答案区域内拖动
          if (answerDropIndex > -1 && answerDropIndex !== answerIndex) {
            // 从原位置移除
            this.dialogueUserAnswers[dialogueIndex].splice(answerIndex, 1)
            // 插入到新位置
            this.dialogueUserAnswers[dialogueIndex].splice(answerDropIndex, 0, this.dialogueDraggedWord)
          }
        } else {
          // 如果单词不在答案中，添加到答案
          if (answerDropIndex > -1) {
            // 插入到指定位置
            this.dialogueUserAnswers[dialogueIndex].splice(answerDropIndex, 0, this.dialogueDraggedWord)
          } else {
            // 添加到末尾
            this.dialogueUserAnswers[dialogueIndex].push(this.dialogueDraggedWord)
          }
        }
        
        this.dialogueDraggedWord = null
        this.dialogueDraggedIndex = null
      }
    },
    removeDialogueItem(dialogueIndex, answerIndex) {
      if (dialogueIndex > -1 && answerIndex > -1 && this.dialogueUserAnswers[dialogueIndex]) {
        const word = this.dialogueUserAnswers[dialogueIndex][answerIndex]
        this.dialogueUserAnswers[dialogueIndex].splice(answerIndex, 1)
        // 不需要将单词放回分词栏，因为getShuffledDialogueWords会自动过滤已有的单词
      }
    },
    resetDialogue() {
      if (this.currentDialogueQuestion) {
        this.dialogueUserAnswers = this.currentDialogueQuestion.dialogues.map(() => [])
      }
    },
    get isDialogueAnswerComplete() {
      if (!this.currentDialogueQuestion) return false
      // 确保dialogueUserAnswers数组长度与对话数量一致
      if (this.dialogueUserAnswers.length !== this.currentDialogueQuestion.dialogues.length) {
        return false
      }
      return this.currentDialogueQuestion.dialogues.every((dialogue, index) => {
        return this.dialogueUserAnswers[index] && this.dialogueUserAnswers[index].length === dialogue.correct.length
      })
    },
    checkDialogueAnswer() {
      if (!this.currentDialogueQuestion) return
      
      let allCorrect = true
      const incorrectDialogues = []
      
      this.currentDialogueQuestion.dialogues.forEach((dialogue, index) => {
        const userAnswer = this.dialogueUserAnswers[index] || []
        if (JSON.stringify(userAnswer) !== JSON.stringify(dialogue.correct)) {
          allCorrect = false
          incorrectDialogues.push({ index, dialogue })
        }
      })
      
      if (allCorrect) {
        ElMessage({
          message: '回答正确！',
          type: 'success',
          duration: 2000
        })
        
        // 显示语法说明
        setTimeout(() => {
          this.showDialogueExplanations()
        }, 2000)
      } else {
        // 显示错误的题目和正确答案
        incorrectDialogues.forEach(({ index, dialogue }) => {
          ElMessage({
            message: `第${index + 1}句回答错误，正确答案：${dialogue.correct.join(' → ')}`,
            type: 'error',
            duration: 3000
          })
        })
      }
    },
    showDialogueExplanations() {
      // 显示语法说明
      let explanationMessage = '语法说明：\n'
      this.currentDialogueQuestion.dialogues.forEach((dialogue, index) => {
        explanationMessage += `第${index + 1}句：${dialogue.explanation}\n`
      })
      
      ElMessage({
        message: explanationMessage,
        type: 'info',
        duration: 5000
      })
      
      // 检查是否还有下一个题目
      if (this.currentDialogueIndex < dialogueQuestions.length - 1) {
        // 进入下一个题目
        setTimeout(() => {
          this.currentDialogueIndex++
          this.currentDialogueQuestion = dialogueQuestions[this.currentDialogueIndex]
          this.dialogueUserAnswers = this.currentDialogueQuestion.dialogues.map(() => [])
        }, 5000)
      } else {
        // 所有题目完成，关闭对话框
        setTimeout(() => {
          this.closeDialogueDialog()
        }, 5000)
      }
    },
    closeDialogueDialog() {
      this.dialogueDialogVisible = false
      this.currentDialogueQuestion = null
      this.dialogueUserAnswers = []
      this.dialogueDraggedWord = null
      this.dialogueDraggedIndex = null
    },
    // 工具方法
    shuffleArray(array) {
      const arr = [...array]
      for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return arr
    }
  },
  mounted() {
    this.restoreProgress()
    this.addTodayTomorrowYesterdayQuestions()
  },
  beforeUnmount() {
    if (this.quizClosingTimer) {
      clearTimeout(this.quizClosingTimer)
      this.quizClosingTimer = null
    }
  }
}
</script>

<style scoped>
.animated-gradient {
  background: linear-gradient(-45deg, #e6f3ff, #f0f8ff, #e6f3ff, #f0f9ff, #e6f7ff);
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
  min-height: 100vh;
}
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
.fade-in {
  animation: fadeIn 0.8s ease-in;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.calendar-banner {
  position: relative;
  padding: 32px 36px;
  border-radius: 28px;
  background: linear-gradient(135deg, #6366f1 0%, #7c3aed 45%, #c026d3 100%);
  box-shadow: 0 32px 70px rgba(79, 70, 229, 0.2);
  color: #fff;
  overflow: hidden;
}
.banner-icon {
  width: 70px;
  height: 70px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.25);
}
.calendar-banner__hand {
  position: absolute;
  bottom: -40px;
  right: -60px;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0));
  opacity: 0.6;
  pointer-events: none;
}

.calendar-info-card {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 28px;
  padding: 28px 32px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(129, 140, 248, 0.16);
  box-shadow: 0 24px 60px rgba(99, 102, 241, 0.14);
  backdrop-filter: blur(12px);
}
.info-right ul {
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-size: 0.95rem;
  color: #475569;
}
.info-right li span {
  font-weight: 600;
  color: #4338ca;
  margin-right: 6px;
}
.review-lesson-button-container {
  margin-top: 20px;
  display: flex;
  gap: 12px;
}
.review-lesson-button {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 20px;
  transition: all 0.3s ease;
}
.review-lesson-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}
.milestone-progress {
  margin-top: 24px;
}
.milestone-progress__bar {
  height: 12px;
  background: rgba(226, 232, 240, 0.9);
  border-radius: 9999px;
  overflow: hidden;
}
.milestone-progress__fill {
  height: 100%;
  border-radius: 9999px;
  background: linear-gradient(90deg, rgba(129, 140, 248, 0.22), rgba(129, 140, 248, 0.65));
  transition: width 0.4s ease;
}
.milestone-progress__label {
  margin-top: 10px;
  font-size: 0.9rem;
  color: #4338ca;
  font-weight: 600;
}

.calendar-panel {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 24px;
  box-shadow: 0 24px 60px rgba(99, 102, 241, 0.14);
  border: 1px solid rgba(148, 163, 184, 0.2);
  padding: 28px 32px 36px;
}
.calendar-panel__header {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 24px;
}
.year-display {
  display: flex;
  align-items: center;
  gap: 14px;
  font-weight: 600;
  color: #312e81;
}
.year-button {
  border-radius: 16px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #c4b5fd, #a5b4fc);
  color: #fff;
  font-weight: 700;
  border: none;
}
.month-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
}
.month-button {
  padding: 9px 12px;
  border-radius: 9999px;
  border: 1px solid rgba(129, 140, 248, 0.18);
  background: rgba(248, 250, 252, 0.85);
  color: #4338ca;
  font-weight: 600;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.month-button:hover {
  border-color: #6366f1;
  color: #6366f1;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}

.month-button.active {
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 12px 30px rgba(99, 102, 241, 0.2);
}

.month-button.has-questions {
  border-color: #a78bfa;
  color: #7e22ce;
}

.month-button.has-uncompleted-questions {
  border-color: #f472b6;
  color: #db2777;
  animation: pulse 2s infinite;
}

.month-marker {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: #ec4899;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(236, 72, 153, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(236, 72, 153, 0);
  }
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 12px;
}
.calendar-weekday {
  text-align: center;
  font-weight: 600;
  color: #4338ca;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.18);
}
.calendar-day {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.9);
  box-shadow: inset 0 0 0 1px rgba(203, 213, 225, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.calendar-day.has-question {
  border: 2px solid rgba(99, 102, 241, 0.25);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.3), 0 4px 12px rgba(99, 102, 241, 0.15);
}

.calendar-day:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 30px rgba(148, 163, 184, 0.18);
}
.calendar-day--empty {
  background: transparent;
  box-shadow: none;
  pointer-events: none;
}
.day-number {
  position: absolute;
  top: 10px;
  left: 12px;
  font-weight: 600;
  color: #334155;
}
.day-marker {
  position: relative;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3), 0 8px 20px rgba(99, 102, 241, 0.4);
  transition: transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.marker-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.6), transparent 70%);
  animation: glow-pulse 2s ease-in-out infinite;
}

/* 未完成的题目 - 白色进度点，带脉冲动画 */
.calendar-day.is-available .day-marker {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.9));
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.4), 0 0 20px rgba(99, 102, 241, 0.6), 0 8px 24px rgba(99, 102, 241, 0.5);
  transform: scale(1.1);
}

.calendar-day.is-available:hover .day-marker {
  transform: scale(1.25);
  box-shadow: 0 0 0 5px rgba(99, 102, 241, 0.5), 0 0 30px rgba(99, 102, 241, 0.8), 0 12px 32px rgba(99, 102, 241, 0.6);
}

/* 脉冲动画 */
.pulse-animation {
  animation: pulse-scale 2s ease-in-out infinite;
}

@keyframes pulse-scale {
  0%, 100% {
    transform: scale(1.1);
  }
  50% {
    transform: scale(1.2);
  }
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.3);
  }
}

/* 已完成的题目 - 绿色进度点 */
.calendar-day.is-completed .day-marker {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(16, 185, 129, 0.7));
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3), 0 10px 24px rgba(16, 185, 129, 0.4);
  transform: scale(1.2);
}

.calendar-day.is-completed .marker-glow {
  background: radial-gradient(circle, rgba(16, 185, 129, 0.5), transparent 70%);
  animation: none;
}

/* 引导提示文字 */
.question-hint {
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 600;
  color: #6366f1;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
  z-index: 10;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.calendar-day.is-available:hover .question-hint {
  opacity: 1;
  transform: translateX(-50%) translateY(-4px);
}

.calendar-day.is-available {
  cursor: pointer;
  position: relative;
}

.calendar-day.is-available:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(99, 102, 241, 0.25);
}

.calendar-day.is-today {
  outline: 2px solid rgba(129, 140, 248, 0.6);
  outline-offset: 3px;
}

.milestone-dialog {
  border-radius: 20px !important;
  padding: 20px 26px !important;
}

.quiz-dialog :deep(.el-dialog__header) {
  margin: 0;
  padding: 0;
}

.quiz-dialog__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 22px 0;
}

.quiz-dialog__title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #312e81;
}

.quiz-dialog__subtitle {
  font-size: 0.9rem;
  color: #6366f1;
  margin-top: 6px;
}

.quiz-dialog__close {
  border: none;
  background: rgba(99, 102, 241, 0.12);
  color: #4c1d95;
  font-size: 20px;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
}

.quiz-dialog__close:hover {
  background: rgba(99, 102, 241, 0.22);
}

.quiz-dialog__body {
  padding: 18px 22px 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.quiz-dialog__question {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1f2937;
}

.quiz-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.quiz-option {
  position: relative;
  border: 2px solid transparent;
  border-radius: 18px;
  overflow: hidden;
  background: #f8fafc;
  box-shadow: 0 12px 30px rgba(148, 163, 184, 0.18);
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quiz-option img {
  max-width: 100%;
  max-height: 140px;
  object-fit: contain;
}

.quiz-option:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 40px rgba(99, 102, 241, 0.18);
  border-color: rgba(99, 102, 241, 0.3);
}

.quiz-option.state-correct {
  border-color: rgba(16, 185, 129, 0.8);
  box-shadow: 0 18px 40px rgba(16, 185, 129, 0.22);
}

.quiz-option.state-incorrect {
  border-color: rgba(248, 113, 113, 0.8);
  box-shadow: 0 18px 40px rgba(248, 113, 113, 0.25);
}

.quiz-option__status {
  position: absolute;
  bottom: 12px;
  right: 12px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  background: rgba(16, 185, 129, 0.85);
}

.quiz-option.state-incorrect .quiz-option__status {
  background: rgba(248, 113, 113, 0.9);
}

/* 教学对话框样式 */
.teaching-dialog {
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.teaching-dialog__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.teaching-dialog__title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.teaching-dialog__close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.teaching-dialog__close:hover {
  background-color: #f0f0f0;
  color: #666;
}

.teaching-dialog__body {
  padding: 30px 24px;
  background: #f9fafb;
  display: flex;
  justify-content: center;
  align-items: center;
}

.teaching-dialog__body img {
  max-width: 300px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .teaching-dialog__body img {
    max-width: 70vw;
    max-width: min(70vw, 200px);
  }
}

.teaching-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.teaching-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.teaching-dialog__footer {
  display: flex;
  justify-content: center;
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
}

.teaching-dialog__button {
  background: #6366f1;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.teaching-dialog__button:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

/* 小课堂对话框样式 */
.lesson-dialog {
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  max-height: 80vh;
  margin: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.lesson-dialog__body {
  max-height: 60vh;
  overflow-y: auto;
  padding: 32px 28px;
  background: #f9fafb;
  flex: 1;
}

.lesson-dialog__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 16px 16px 0 0;
}

.lesson-dialog__title {
  font-size: 20px;
  font-weight: 600;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.lesson-dialog__close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: white;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.lesson-dialog__close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.lesson-dialog__body {
  padding: 32px 28px;
  background: #f9fafb;
}

.lesson-dialog__content {
  font-size: 16px;
  line-height: 1.6;
  color: #4b5563;
  margin-bottom: 24px;
  text-align: center;
}

.lesson-section {
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.lesson-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.lesson-section__title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.lesson-section__content {
  font-size: 15px;
  line-height: 1.5;
  color: #4b5563;
  margin: 0;
}

.lesson-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px 28px;
  border-top: 1px solid #f0f0f0;
  background: white;
  border-radius: 0 0 16px 16px;
}

.lesson-dialog__button {
  background: #6366f1;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  max-width: 180px;
}

.lesson-dialog__button:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.lesson-dialog__button.save-button {
  background: #10b981;
}

.lesson-dialog__button.save-button:hover {
  background: #059669;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .lesson-dialog {
    width: 90% !important;
  }
  
  .lesson-dialog__header,
  .lesson-dialog__body,
  .lesson-dialog__footer {
    padding: 20px;
  }
  
  .lesson-dialog__button {
    max-width: none;
  }
}

/* 句子排序样式 */
.sentence-sort-dialog__body {
  padding: 30px;
  background: #f9fafb;
}

.sentence-sort__prompt {
  margin-bottom: 30px;
  text-align: center;
}

.sentence-sort__prompt-text {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
}

.sentence-sort__drag-area {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  margin-bottom: 40px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.sentence-sort__word {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: grab;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.sentence-sort__word:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

.sentence-sort__word:active {
  cursor: grabbing;
}

.sentence-sort__drop-area {
  margin-top: 30px;
}

.sentence-sort__drop-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 15px;
  text-align: center;
}

.sentence-sort__drop-line {
  position: relative;
  min-height: 60px;
  border-bottom: 3px solid #6366f1;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding-bottom: 10px;
  flex-wrap: wrap;
}

.sentence-sort__drop-placeholder {
  color: #9ca3af;
  font-style: italic;
  align-self: center;
  flex: 1;
  text-align: center;
}

.sentence-sort__drop-item {
  position: relative;
  background: #f3f4f6;
  border: 2px solid #6366f1;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  cursor: grab;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sentence-sort__drop-item:hover {
  background: #e0e7ff;
  transform: translateY(-2px);
}

.sentence-sort__drop-item:active {
  cursor: grabbing;
}

.sentence-sort__remove-item {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sentence-sort__remove-item:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.sentence-sort-dialog__footer {
  padding: 20px 30px;
  background: white;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 对话练习样式 */
.dialogue-dialog {
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.dialogue-dialog__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 30px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 16px 16px 0 0;
}

.dialogue-dialog__title {
  font-size: 20px;
  font-weight: 600;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.dialogue-dialog__subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 6px;
}

.dialogue-dialog__close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: white;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.dialogue-dialog__close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.dialogue-dialog__body {
  padding: 15px;
  background: #f9fafb;
}

.dialogue__scenario {
  margin-bottom: 15px;
  padding: 12px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.dialogue__scenario-text {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  text-align: center;
}

.dialogue__content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dialogue__item {
  padding: 15px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.dialogue__item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.dialogue__item-header {
  margin-bottom: 12px;
  text-align: center;
}

.dialogue__item-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.dialogue__item-oral {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.dialogue__item-drag-area {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-bottom: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px dashed #d1d5db;
}

.dialogue__word {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: grab;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.dialogue__word:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.dialogue__word:active {
  cursor: grabbing;
}

.dialogue__item-drop-area {
  margin-top: 15px;
}

.dialogue__item-drop-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  text-align: center;
}

.dialogue__item-drop-line {
  position: relative;
  min-height: 50px;
  border-bottom: 3px solid #10b981;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding-bottom: 10px;
  overflow-x: auto;
  flex-wrap: nowrap;
}

.dialogue__item-drop-placeholder {
  color: #9ca3af;
  font-style: italic;
  align-self: center;
  flex: 1;
  text-align: center;
}

.dialogue__item-drop-item {
  position: relative;
  background: #f3f4f6;
  border: 2px solid #10b981;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  cursor: grab;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dialogue__item-drop-item:hover {
  background: #d1fae5;
  transform: translateY(-2px);
}

.dialogue__item-drop-item:active {
  cursor: grabbing;
}

.dialogue__item-remove-item {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dialogue__item-remove-item:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.dialogue-dialog__footer {
  padding: 20px 30px;
  background: white;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 语法锦囊对话框样式 */
.grammar-bag-dialog {
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  max-height: 80vh;
  margin: 20px;
}

.grammar-bag-dialog__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 30px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 16px 16px 0 0;
}

.grammar-bag-dialog__title {
  font-size: 20px;
  font-weight: 600;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.grammar-bag-dialog__close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: white;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.grammar-bag-dialog__close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.grammar-bag-dialog__body {
  padding: 30px;
  background: #f9fafb;
  max-height: 60vh;
  overflow-y: auto;
}

.grammar-bag-dialog__content {
  font-size: 16px;
  line-height: 1.6;
  color: #4b5563;
  margin-bottom: 24px;
}

.grammar-bag-section {
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.grammar-bag-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.grammar-bag-section__title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.grammar-bag-section__content {
  font-size: 15px;
  line-height: 1.5;
  color: #4b5563;
  margin: 0;
}

.grammar-bag-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px 30px;
  border-top: 1px solid #f0f0f0;
  background: white;
  border-radius: 0 0 16px 16px;
}

.grammar-bag-dialog__button {
  background: #6366f1;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  max-width: 180px;
}

.grammar-bag-dialog__button:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.grammar-bag-dialog__button.primary-button {
  background: #10b981;
}

.grammar-bag-dialog__button.primary-button:hover {
  background: #059669;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

/* 响应式调整 */
@media (max-width: 992px) {
  .calendar-info-card {
    grid-template-columns: 1fr;
  }
  .month-selector {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  }
  
  .sentence-sort__word {
    width: 60px;
    height: 60px;
    font-size: 12px;
  }
  
  .sentence-sort__drop-line {
    min-height: 50px;
  }
}
</style>

