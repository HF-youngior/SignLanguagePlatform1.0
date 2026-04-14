<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-slate-900">系统概览</h2>

    <div v-if="loading" class="space-y-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <div v-for="n in 5" :key="`kpi-skeleton-${n}`" class="h-28 animate-pulse rounded-lg bg-white shadow" />
      </div>
      <div class="h-80 animate-pulse rounded-lg bg-white shadow" />
    </div>

    <div v-else-if="error" class="rounded-lg bg-white p-6 shadow">
      <p class="text-red-600">{{ error }}</p>
      <button class="mt-4 rounded-md bg-slate-800 px-3 py-2 text-sm text-white" @click="$emit('retry')">重试</button>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <div v-for="card in kpiCards" :key="card.key" class="rounded-lg bg-white p-5 shadow">
          <div class="text-sm text-slate-500">{{ card.label }}</div>
          <div class="mt-2 text-3xl font-semibold text-slate-900">{{ card.value }}</div>
        </div>
      </div>

      <div class="rounded-lg bg-white p-6 shadow">
        <h3 class="mb-4 text-lg font-semibold text-slate-900">今日新增</h3>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div class="rounded-md bg-blue-50 p-4">
            <div class="text-sm text-blue-700">新增用户</div>
            <div class="mt-1 text-2xl font-bold text-blue-900">{{ today.newUsers }}</div>
          </div>
          <div class="rounded-md bg-emerald-50 p-4">
            <div class="text-sm text-emerald-700">新增帖子</div>
            <div class="mt-1 text-2xl font-bold text-emerald-900">{{ today.newPosts }}</div>
          </div>
          <div class="rounded-md bg-amber-50 p-4">
            <div class="text-sm text-amber-700">新增评论</div>
            <div class="mt-1 text-2xl font-bold text-amber-900">{{ today.newComments }}</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div class="rounded-lg bg-white p-6 shadow xl:col-span-3">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-900">近 N 天新增趋势</h3>
            <span class="text-xs text-slate-500">用户 / 帖子 / 评论</span>
          </div>
          <div v-if="trendHasData" class="h-72">
            <Line :data="trendChartData" :options="trendChartOptions" />
          </div>
          <div v-else class="flex h-72 items-center justify-center text-slate-400">暂无趋势数据</div>
        </div>

        <div class="rounded-lg bg-white p-6 shadow xl:col-span-2">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-900">社群活跃分布</h3>
            <span class="text-xs text-slate-500">按近 N 天消息量</span>
          </div>
          <div v-if="groupHasData" class="h-72">
            <Bar :data="groupChartData" :options="groupChartOptions" />
          </div>
          <div v-else class="flex h-72 items-center justify-center text-slate-400">暂无社群活跃数据</div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div class="rounded-lg bg-white p-6 shadow">
          <h3 class="mb-4 text-lg font-semibold text-slate-900">活跃用户 TOP</h3>
          <div v-if="topUsers.length === 0" class="text-sm text-slate-400">暂无数据</div>
          <ul v-else class="space-y-3">
            <li v-for="(item, index) in topUsers" :key="`u-${item.id}`" class="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2">
              <div class="min-w-0">
                <div class="truncate text-sm font-medium text-slate-900">{{ index + 1 }}. {{ item.username }}</div>
                <div class="text-xs text-slate-500">帖 {{ item.postCount }} / 评 {{ item.commentCount }} / 群聊 {{ item.messageCount }}</div>
              </div>
              <div class="ml-3 text-sm font-semibold text-slate-700">{{ item.activityScore }}</div>
            </li>
          </ul>
        </div>

        <div class="rounded-lg bg-white p-6 shadow">
          <h3 class="mb-4 text-lg font-semibold text-slate-900">互动帖子 TOP</h3>
          <div v-if="topPosts.length === 0" class="text-sm text-slate-400">暂无数据</div>
          <ul v-else class="space-y-3">
            <li v-for="(item, index) in topPosts" :key="`p-${item.id}`" class="rounded-md border border-slate-100 px-3 py-2">
              <div class="truncate text-sm font-medium text-slate-900">{{ index + 1 }}. {{ item.title }}</div>
              <div class="mt-1 flex items-center justify-between text-xs text-slate-500">
                <span>{{ item.authorUsername || '-' }}</span>
                <span>评 {{ item.commentCount }} / 赞 {{ item.likeCount }}</span>
              </div>
            </li>
          </ul>
        </div>

        <div class="rounded-lg bg-white p-6 shadow">
          <div class="mb-2 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-900">最近管理操作</h3>
            <span class="text-xs text-slate-500">近 {{ operationDays }} 天 {{ operationTotal }} 次</span>
          </div>
          <div v-if="recentOperations.length === 0" class="text-sm text-slate-400">暂无操作记录</div>
          <ul v-else class="max-h-96 space-y-3 overflow-y-auto">
            <li v-for="log in recentOperations" :key="`log-${log.id}`" class="rounded-md border border-slate-100 px-3 py-2">
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium text-slate-900">{{ log.action }}</span>
                <span class="text-xs text-slate-400">{{ formatDate(log.created_at) }}</span>
              </div>
              <div class="mt-1 text-xs text-slate-500">
                管理员 {{ log.admin_username }} · {{ log.target_type || '-' }} #{{ log.target_id || '-' }}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({
      users: {},
      posts: {},
      comments: {},
      learning: {},
      translations: {}
    })
  },
  dashboard: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
})

defineEmits(['retry'])

const toNumber = (value) => Number(value || 0)

const kpis = computed(() => ({
  totalUsers: toNumber(props.dashboard?.kpis?.totalUsers ?? props.stats?.users?.total_users),
  totalPosts: toNumber(props.dashboard?.kpis?.totalPosts ?? props.stats?.posts?.total_posts),
  totalComments: toNumber(props.dashboard?.kpis?.totalComments ?? props.stats?.comments?.total_comments),
  totalGroups: toNumber(props.dashboard?.kpis?.totalGroups),
  activeUsers: toNumber(props.dashboard?.kpis?.activeUsers ?? props.stats?.users?.active_users)
}))

const kpiCards = computed(() => ([
  { key: 'users', label: '总用户数', value: kpis.value.totalUsers },
  { key: 'posts', label: '总帖子数', value: kpis.value.totalPosts },
  { key: 'comments', label: '总评论数', value: kpis.value.totalComments },
  { key: 'groups', label: '总社群数', value: kpis.value.totalGroups },
  { key: 'active-users', label: '活跃用户', value: kpis.value.activeUsers }
]))

const today = computed(() => ({
  newUsers: toNumber(props.dashboard?.today?.newUsers ?? props.stats?.users?.new_users_today),
  newPosts: toNumber(props.dashboard?.today?.newPosts ?? props.stats?.posts?.new_posts_today),
  newComments: toNumber(props.dashboard?.today?.newComments ?? props.stats?.comments?.new_comments_today)
}))

const trendLabels = computed(() => props.dashboard?.trend?.dates || [])
const trendHasData = computed(() => trendLabels.value.length > 0)

const trendChartData = computed(() => ({
  labels: trendLabels.value,
  datasets: [
    {
      label: '新增用户',
      data: props.dashboard?.trend?.newUsers || [],
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      tension: 0.25
    },
    {
      label: '新增帖子',
      data: props.dashboard?.trend?.newPosts || [],
      borderColor: '#059669',
      backgroundColor: 'rgba(5, 150, 105, 0.1)',
      tension: 0.25
    },
    {
      label: '新增评论',
      data: props.dashboard?.trend?.newComments || [],
      borderColor: '#d97706',
      backgroundColor: 'rgba(217, 119, 6, 0.1)',
      tension: 0.25
    }
  ]
}))

const trendChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { position: 'top' }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { precision: 0 }
    }
  }
}

const groupActivity = computed(() => props.dashboard?.groupActivity || [])
const groupHasData = computed(() => groupActivity.value.length > 0)

const groupChartData = computed(() => ({
  labels: groupActivity.value.map(item => item.name),
  datasets: [
    {
      label: '消息量',
      data: groupActivity.value.map(item => toNumber(item.messageCount)),
      backgroundColor: 'rgba(99, 102, 241, 0.6)',
      borderColor: '#4f46e5',
      borderWidth: 1
    }
  ]
}))

const groupChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: { display: false }
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: { precision: 0 }
    }
  }
}

const topUsers = computed(() => props.dashboard?.topUsers || [])
const topPosts = computed(() => props.dashboard?.topPosts || [])
const recentOperations = computed(() => props.dashboard?.operations?.recent || [])
const operationTotal = computed(() => toNumber(props.dashboard?.operations?.totalInRange))
const operationDays = computed(() => toNumber(props.dashboard?.operations?.lastDays))

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>