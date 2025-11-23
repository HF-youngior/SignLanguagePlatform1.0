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
              <img src="/logo-zhangzhongyu.svg" alt="掌中语 Logo" class="w-10 h-10 mr-3" />
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
            <el-button type="primary" round size="large" @click="$router.push({ name: 'ChallengeMode' })">
              返回闯关地图
            </el-button>
          </div>
          <div class="calendar-banner__hand" aria-hidden="true"></div>
        </section>

        <section class="calendar-info-card fade-in">
          <div class="info-left">
            <h2 class="text-2xl font-semibold text-slate-900 mb-3">关卡信息</h2>
            <p class="text-slate-600 leading-relaxed">
              当前篇章围绕生活中的日期与数字，从打招呼约时间、安排日程，到节日纪念。把2025年的每一天都变成手语练习的契机。
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
              <li><span>🎯 进度：</span>{{ completedDates.size }} / {{ totalDates }} 已完成</li>
              <li><span>✨ 小提示：</span>点击日历上<strong class="text-indigo-600">白色光点</strong>的日期答题，正确完成即可点亮该日期。</li>
              <li><span>🏆 成就：</span>完成所有题目将获得特别鼓励提示</li>
            </ul>
          </div>
        </section>

        <section class="calendar-panel fade-in">
          <div class="calendar-panel__header">
            <div class="year-display">
              <button class="year-button" disabled>2025</button>
              <span>数字日期练习</span>
            </div>
            <div class="month-selector">
              <button
                v-for="(month, index) in months"
                :key="month.value"
                :class="['month-button', { active: currentMonthIndex === index }]"
                @click="currentMonthIndex = index"
              >
                {{ month.label }}
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
        days: new Date(2025, idx + 1, 0).getDate()
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
      lastQuestion: null
    }
  },
  computed: {
    currentMonthDays() {
      return this.months[this.currentMonthIndex].days
    },
    monthLeadingBlanks() {
      const firstDay = new Date(2025, this.currentMonthIndex, 1).getDay()
      return Array.from({ length: firstDay }, (_, idx) => idx)
    },
    progressPercent() {
      return Math.round((this.completedDates.size / this.totalDates) * 100)
    },
    totalDates() {
      // 只计算题目数量，不是所有日期
      return Object.keys(this.questionMap).length
    },
    isAllCompleted() {
      return this.completedDates.size >= this.totalDates
    }
  },
  mounted() {
    this.restoreProgress()
  },
  beforeUnmount() {
    if (this.quizClosingTimer) {
      clearTimeout(this.quizClosingTimer)
      this.quizClosingTimer = null
    }
  },
  methods: {
    getDateKey(day) {
      const month = String(this.currentMonthIndex + 1).padStart(2, '0')
      const date = String(day).padStart(2, '0')
      return `2025-${month}-${date}`
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
      return today.getFullYear() === 2025 && today.getMonth() === this.currentMonthIndex && today.getDate() === day
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
          this.showMilestoneDialog(milestone)
          if (milestone === 100) {
            this.markLevelCompleted()
          }
        }
      })
      this.persistProgress()
    },
    showMilestoneDialog(percent) {
      const messages = {
        25: '很棒！完成了第一题，闯关旅程正式启程啦！',
        50: '已经完成一半，继续保持，马上完成所有题目！',
        75: '离终点只差一步，冲刺一下就能掌握所有内容！',
        100: '🎉 恭喜完成第一关！你已经掌握了"年"、"星期一"、"二十"和"1月份"的手语表达！'
      }
      
      if (percent === 100) {
        // 100%完成时，显示特殊提示并引导返回
        ElMessageBox.confirm(
          messages[percent] + '\n\n返回闯关地图查看你的成就，下一章节即将解锁！',
          '🎊 关卡完成',
          {
            confirmButtonText: '返回闯关地图',
            cancelButtonText: '继续浏览',
            type: 'success',
            customClass: 'milestone-dialog',
            center: true
          }
        ).then(() => {
          this.$router.push({ name: 'ChallengeMode' })
        }).catch(() => {
          // 用户选择继续浏览，不做任何操作
        })
      } else {
        ElMessageBox.alert(messages[percent], `达成 ${percent}% 里程碑`, {
          confirmButtonText: '继续加油',
          type: 'success',
          customClass: 'milestone-dialog'
        })
      }
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
          // 如果全部完成但还没有显示100%提示，触发检查
          this.checkMilestones()
        }
      })
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
}
.month-button.active {
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 12px 30px rgba(99, 102, 241, 0.2);
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
.teaching-dialog :deep(.el-dialog__header) {
  margin: 0;
  padding: 0;
}

.teaching-dialog__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 22px 0;
}

.teaching-dialog__title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #312e81;
}

.teaching-dialog__subtitle {
  font-size: 0.9rem;
  color: #6366f1;
  margin-top: 6px;
}

.teaching-dialog__close {
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

.teaching-dialog__close:hover {
  background: rgba(99, 102, 241, 0.22);
}

.teaching-dialog__body {
  padding: 24px 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.teaching-dialog__body img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.teaching-dialog__footer {
  padding: 0 22px 20px;
  display: flex;
  justify-content: center;
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

