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
              <span>掌中语-手语学习平台</span>
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/home" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">首页</router-link>
            <router-link to="/learn" class="nav-link text-blue-700 font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500 after:rounded-full">学习</router-link>
            <router-link to="/translate" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">翻译</router-link>
            <router-link to="/community" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">社区</router-link>
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
                @click="showLessonDialog"
                class="review-lesson-button"
              >
                📚 复习锦囊
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
      lessonSavedToBag: false
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
    markLevelCompleted() {
      const storedCompleted = Number(localStorage.getItem(STORAGE_KEYS.completedLevels) || 0)
      if (storedCompleted < 1) {
        localStorage.setItem(STORAGE_KEYS.completedLevels, '1')
        this.$nextTick(() => {
          window.dispatchEvent(new CustomEvent('challenge-progress-changed'))
          ElMessage({
            message: '篇章一完成！闯关地图已为你点亮新的篇章入口。',
            type: 'success',
            duration: 5000
          })
        })
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
                    this.checkMilestones()
                  }
                }
              }
            )
          }, 2000)
        }
      })
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
}
.review-lesson-button {
  width: 100%;
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

@media (max-width: 992px) {
  .calendar-info-card {
    grid-template-columns: 1fr;
  }
  .month-selector {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  }
}
</style>

