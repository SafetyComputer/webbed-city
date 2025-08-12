<template>
  <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-bold text-white">当前房间</h3>
      <button @click="fetchRooms"
        class="text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center space-x-1"
        :disabled="isLoadingRooms">
        <svg class="w-4 h-4" :class="{ 'animate-spin': isLoadingRooms }" fill="none" stroke="currentColor"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
          </path>
        </svg>
        <span>刷新</span>
      </button>
    </div>

    <div v-if="isLoadingRooms" class="text-center py-8">
      <div class="inline-flex items-center space-x-2 text-slate-400">
        <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
          </path>
        </svg>
        <span>正在加载房间...</span>
      </div>
    </div>

    <div v-else-if="rooms.length === 0" class="text-center py-8">
      <div class="text-slate-400 space-y-2">
        <svg class="w-12 h-12 mx-auto text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
          </path>
        </svg>
        <p>暂无可用房间</p>
        <p class="text-sm">点击"创建房间"开始新的对局</p>
      </div>
    </div>

    <div v-else class="space-y-3">
      <div v-for="room in rooms" :key="room.room"
        class="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
        <div class="flex items-center space-x-4">
          <div
            class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold">#{{ numberToBase64(room.room).slice(0, 3) }}</span>
          </div>
          <div>
            <h4 class="text-white font-medium">房间 {{ numberToBase64(room.room) }}</h4>
            <div class="flex items-center space-x-3 text-sm">
              <span :class="getRoomStatus(room).color">{{ getRoomStatus(room).text }}</span>
              <span class="text-slate-400">•</span>
              <span class="text-slate-400">{{ getPlayerCount(room) }} / 2 玩家</span>
              <span v-if="room.viewers.length > 0" class="text-slate-400">•</span>
              <span v-if="room.viewers.length > 0" class="text-slate-400">{{ room.viewers.length -
                getPlayerCount(room) }} 观众</span>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button v-if="getPlayerCount(room) < 2" @click="handleJoinRoom(room.room)"
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors">
            加入游戏
          </button>
          <button @click="handleWatchRoom(room.room)"
            class="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-lg transition-colors">
            观战
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { API } from '@/services'
import { numberToBase64 } from '@/utils/base64'
import type { MatchInfo } from '@/services/rooms/types'
import router from '@/router'

const rooms = ref<MatchInfo[]>([])
const isLoadingRooms = ref(false)

const fetchRooms = async () => {
  isLoadingRooms.value = true
  await API.rooms.getRooms()
    .then((response) => {
      rooms.value = response.data
    })
    .catch((error) => {
      console.error('获取房间列表失败:', error)
      alert('获取房间列表失败，请稍后重试')
    })
    .finally(() => {
      isLoadingRooms.value = false
    })
}

const handleJoinRoom = async (roomId: number) => {
  router.push(`/game/${numberToBase64(roomId)}`)
}

const handleWatchRoom = async (roomId: number) => {
  router.push(`/game/${numberToBase64(roomId)}?spectator=true`)
}


const getPlayerCount = (room: MatchInfo) => {
  return Number(Boolean(room.player_blue)) + Number(Boolean(room.player_green))
}

const getRoomStatus = (room: MatchInfo) => {
  const playerCount = getPlayerCount(room)
  if (playerCount === 0) return { text: '等待玩家', color: 'text-slate-400' }
  if (playerCount === 1) return { text: '等待对手', color: 'text-yellow-400' }
  if (playerCount === 2) return { text: '游戏中', color: 'text-green-400' }
  return { text: '未知状态', color: 'text-slate-400' }
}

onMounted(() => {
  fetchRooms()
})
</script>

<style scoped>
/* Add any specific styles for the room list here */
</style>
