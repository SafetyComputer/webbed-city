<template>

  <!-- 游戏模式选择 -->
  <div class="grid md:grid-cols-2 gap-8">
    <!-- 快速匹配 -->
    <div class="bg-slate-800/50 backdrop-blur rounded-xl p-8 border border-slate-700 text-center space-y-4">
      <div
        class="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z">
          </path>
        </svg>
      </div>
      <h3 class="text-2xl font-bold text-white">快速匹配</h3>
      <p class="text-slate-400">系统自动为您匹配同等级的对手</p>
      <button @click="handleQuickMatch" :class="{ 'opacity-75': isMatching }"
        class="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center ">
        <span v-if="isMatching" class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          匹配中...（点击取消）
        </span>
        <span v-else>开始匹配</span>
      </button>
    </div>

    <!-- 创建房间 -->
    <div class="bg-slate-800/50 backdrop-blur rounded-xl p-8 border border-slate-700 text-center space-y-4">
      <div
        class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
      </div>
      <h3 class="text-2xl font-bold text-white">创建房间</h3>
      <p class="text-slate-400">创建私人房间，邀请朋友对战</p>
      <button @click="handleCreateRoom" :disabled="isMatching"
        class="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed">
        创建房间
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useWebSocket } from '@/composables/useWebSocket'
import type { WebSocketMessage } from '@/stores/websocket'
import { API } from '@/services'
import { ref } from 'vue'
import { numberToBase64 } from '@/utils/base64'



const router = useRouter()
const { onceMessage } = useWebSocket()
const isMatching = ref(false)


const handleQuickMatch = async () => {
  if (!isMatching.value) {
    isMatching.value = true
    API.matchmaking.startMatching()
      .catch((error) => {
        console.error('快速匹配失败:', error)
        alert('快速匹配失败，请稍后重试')
        isMatching.value = false
      })
  } else {
    API.matchmaking.stopMatching()
      .then(() => {
        isMatching.value = false
      })
      .catch((error) => {
        console.error('取消匹配失败:', error)
        alert('取消匹配失败，请稍后重试')
      })
  }
}


onceMessage('Match', (msg: WebSocketMessage) => {
  isMatching.value = false
  const roomId = msg.room
  router.push(`/game/${numberToBase64(roomId)}`)
})

const handleCreateRoom = async () => {
  await API.rooms.createRoom()
    .then((response) => {
      const roomId = response.data
      router.push(`/game/${numberToBase64(roomId)}`)
    })
    .catch((error) => {
      console.error('创建房间失败:', error)
      alert('创建房间失败，请稍后重试')
    })
}
</script>

<style scoped>
/* Add any specific styles for the game lobby here */
</style>
