<template>
  <header class="bg-slate-800/50 backdrop-blur border-b border-slate-700">
    <div class="container mx-auto px-4 py-4 flex justify-between items-center">
      <div class="flex items-center space-x-2">
        <img src="/icon.png" alt="围城 Logo" class="w-8 h-8 rounded-lg" />
        <h1 class="text-2xl font-bold text-white">围城</h1>
      </div>

      <!-- 未登录状态 -->
      <div v-if="!userStore.isAuthenticated" class="flex items-center space-x-4">
        <RouterLink to="/login" class="text-slate-300 hover:text-white transition-colors">
          登录
        </RouterLink>
        <RouterLink to="/register"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-medium">
          注册
        </RouterLink>
      </div>

      <!-- 已登录状态 -->
      <div v-else class="flex items-center space-x-4">
        <!-- WebSocket连接状态 -->
        <WebSocketStatus />

        <!-- WebSocket测试链接 -->
        <RouterLink to="/ws-test" class="text-slate-300 hover:text-blue-400 transition-colors text-sm"
          title="WebSocket测试">
          测试
        </RouterLink>

        <div class="flex items-center space-x-3">
          <div class="text-right">
            <div class="text-white font-medium">{{ userStore.userDisplayName }}</div>
            <div class="text-slate-400 text-sm">ELO: {{ userStore.userElo }}</div>
          </div>
          <div
            class="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            <span class="text-white font-bold text-lg">{{ userStore.userDisplayName.charAt(0).toUpperCase() }}</span>
          </div>
        </div>
        <button @click="handleLogout"
          class="text-slate-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-slate-700/50">
          退出登录
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import WebSocketStatus from '@/components/WebSocketStatus.vue'
import { API } from '@/services'

const userStore = useUserStore()
const router = useRouter()

const handleLogout = async () => {
  await API.users.logout()
    .then(() => {
      userStore.logout()
    })
    .catch((error) => {
      console.error('退出登录失败:', error)
      if (error.response.data === "haven't logged in") {
        userStore.logout()
      } else {
        alert('退出登录失败，请稍后重试')
      }
    })
    .finally(() => {
      router.push('/')
    })
}
</script>

<style scoped>
/* Add any specific styles for the header here */
</style>
