<template>
  <div class="px-4 sm:px-0">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">社群管理</h2>
    
    <!-- 搜索 -->
    <div class="bg-white shadow rounded-lg p-4 mb-6">
      <div class="flex gap-4">
        <input
          v-model="groupSearch"
          type="text"
          placeholder="搜索社群名称..."
          class="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="fetchGroups"
        />
        <button
          @click="fetchGroups"
          class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          搜索
        </button>
      </div>
    </div>

    <!-- 社群列表 -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">社群名称</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建者</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成员数</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="group in groups" :key="group.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ group.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ group.creator_username }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ group.member_count || 0 }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(group.created_at) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="viewGroup(group)"
                class="text-blue-600 hover:text-blue-900 mr-3"
              >
                查看
              </button>
              <button
                @click="deleteGroup(group)"
                class="text-red-600 hover:text-red-900"
              >
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 社群详情弹窗 -->
    <div v-if="showGroupDetail" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">社群详情</h3>
          <button @click="showGroupDetail = false" class="text-gray-500 hover:text-gray-700">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div v-if="currentGroup" class="space-y-6">
          <!-- 社群基本信息 -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-xl font-bold text-gray-900">{{ currentGroup.name }}</h4>
            <div class="mt-2 space-y-1 text-sm text-gray-600">
              <p><span class="font-medium">创建者:</span> {{ currentGroup.creator_username }}</p>
              <p><span class="font-medium">创建时间:</span> {{ formatDate(currentGroup.created_at) }}</p>
              <p><span class="font-medium">成员数:</span> {{ currentMembers.length }}</p>
              <p v-if="currentGroup.description"><span class="font-medium">描述:</span> {{ currentGroup.description }}</p>
            </div>
          </div>

          <!-- 成员管理 -->
          <div>
            <h4 class="text-lg font-medium text-gray-900 mb-3">成员管理</h4>
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">加入时间</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="member in currentMembers" :key="member.user_id">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-8 w-8">
                          <img
                            v-if="member.user_avatar"
                            :src="member.user_avatar"
                            class="h-8 w-8 rounded-full"
                            alt=""
                          />
                          <div v-else class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                            {{ member.user_username.charAt(0).toUpperCase() }}
                          </div>
                        </div>
                        <div class="ml-3">
                          <div class="text-sm font-medium text-gray-900">{{ member.user_username }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="{
                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                        'bg-red-100 text-red-800': member.role === 'owner',
                        'bg-yellow-100 text-yellow-800': member.role === 'admin',
                        'bg-green-100 text-green-800': member.role === 'member'
                      }">
                        {{ member.role === 'owner' ? '群主' : member.role === 'admin' ? '管理员' : '成员' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(member.joined_at) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        v-if="member.role !== 'owner'"
                        @click="removeMember(member)"
                        class="text-red-600 hover:text-red-900"
                      >
                        移出
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 聊天记录 -->
          <div>
            <h4 class="text-lg font-medium text-gray-900 mb-3">聊天记录</h4>
            <div class="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <div v-for="message in currentMessages" :key="message.id" class="mb-4">
                <div class="flex items-start">
                  <div class="flex-shrink-0 h-8 w-8">
                    <img
                      v-if="message.user_avatar"
                      :src="message.user_avatar"
                      class="h-8 w-8 rounded-full"
                      alt=""
                    />
                    <div v-else class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      {{ message.user_username.charAt(0).toUpperCase() }}
                    </div>
                  </div>
                  <div class="ml-3 flex-1">
                    <div class="flex items-center">
                      <span class="text-sm font-medium text-gray-900">{{ message.user_username }}</span>
                      <span class="ml-2 text-xs text-gray-500">{{ formatDate(message.created_at) }}</span>
                    </div>
                    <div class="mt-1 text-sm text-gray-700">{{ message.content }}</div>
                    <button
                      @click="deleteMessage(message)"
                      class="mt-1 text-xs text-red-600 hover:text-red-900"
                    >
                      删除消息
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200 pt-4 flex justify-end">
            <button
              @click="deleteGroup(currentGroup)"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              删除社群
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  groups: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['fetchGroups', 'viewGroup', 'deleteGroup', 'removeMember', 'deleteMessage'])

const groupSearch = ref('')
const showGroupDetail = ref(false)
const currentGroup = ref(null)
const currentMembers = ref([])
const currentMessages = ref([])

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const fetchGroups = () => {
  emit('fetchGroups', { search: groupSearch.value })
}

const viewGroup = (group) => {
  emit('viewGroup', group, (data) => {
    currentGroup.value = data.group
    currentMembers.value = data.members
    currentMessages.value = data.messages
    showGroupDetail.value = true
  })
}

const deleteGroup = (group) => {
  emit('deleteGroup', group)
}

const removeMember = (member) => {
  emit('removeMember', currentGroup.value, member)
}

const deleteMessage = (message) => {
  emit('deleteMessage', message)
}
</script>