<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { API } from '@/services'
import WebSocketStatus from '@/components/WebSocketStatus.vue'
import type { MatchInfo } from '@/services/rooms/types'
import { numberToBase64 } from '@/utils/base64'


const userStore = useUserStore()
const router = useRouter()

const gameDescription = ref(`
围城是一个策略性双人对弈游戏，玩家需要通过巧妙的布局和移动来包围对手的棋子。
游戏规则简单易学，但策略深度丰富，适合所有年龄段的玩家。
`)

const rooms = ref<MatchInfo[]>([])
const isLoadingRooms = ref(false)

// 获取所有房间列表
const fetchRooms = async () => {
  if (!userStore.isAuthenticated) return

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
// 组件挂载时获取房间列表
onMounted(() => {
  if (userStore.isAuthenticated) {
    fetchRooms()
  }
})

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

const handleQuickMatch = async () => {


}

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
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- Header -->
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

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-12">
      <!-- 未登录用户的欢迎页面 -->
      <div v-if="!userStore.isAuthenticated" class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Left Side - Game Info -->
        <div class="space-y-8">
          <div>
            <h2 class="text-5xl font-bold text-white mb-4">
              开始你的
              <span class="text-blue-400">围城</span>
              之旅
            </h2>
            <p class="text-slate-300 text-lg leading-relaxed">
              {{ gameDescription }}
            </p>
          </div>

          <!-- Game Stats -->
          <div class="grid grid-cols-3 gap-4">
            <div class="bg-slate-800/50 backdrop-blur rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-blue-400">1,234</div>
              <div class="text-slate-400 text-sm">在线玩家</div>
            </div>
            <div class="bg-slate-800/50 backdrop-blur rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-green-400">5,678</div>
              <div class="text-slate-400 text-sm">今日对局</div>
            </div>
            <div class="bg-slate-800/50 backdrop-blur rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-green-500">98.5%</div>
              <div class="text-slate-400 text-sm">在线率</div>
            </div>
          </div>
        </div>

        <!-- Right Side - Game Mode Selection -->
        <div class="space-y-6">
          <h3 class="text-2xl font-bold text-white mb-6">选择游戏模式</h3>

          <!-- AI vs Human -->
          <div
            class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-all cursor-pointer group">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div
                  class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
                    </path>
                  </svg>
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                    人机对战
                  </h4>
                  <p class="text-slate-400 text-sm">与AI对手切磋技艺</p>
                </div>
              </div>
              <svg class="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>

          <!-- Local Multiplayer -->
          <div
            class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 hover:border-green-500 transition-all cursor-pointer group">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div
                  class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
                    </path>
                  </svg>
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">
                    本地对战
                  </h4>
                  <p class="text-slate-400 text-sm">与朋友面对面对弈</p>
                </div>
              </div>
              <svg class="w-5 h-5 text-slate-400 group-hover:text-green-400 transition-colors" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>

          <!-- Online Matchmaking -->
          <div
            class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-all cursor-pointer group">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div
                  class="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                    在线匹配
                  </h4>
                  <p class="text-slate-400 text-sm">与全球玩家竞技</p>
                </div>
              </div>
              <svg class="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>

          <!-- Quick Play Button -->
          <RouterLink to="/game">
            <button
              class="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg">
              快速开始游戏
            </button>
          </RouterLink>
        </div>
      </div>

      <!-- 已登录用户的游戏大厅 -->
      <div v-else class="space-y-8">
        <!-- 欢迎用户 -->
        <div class="text-center space-y-4">
          <h2 class="text-4xl font-bold text-white">
            欢迎回来，<span class="text-blue-400">{{ userStore.userDisplayName }}</span>！
          </h2>
          <p class="text-slate-300 text-lg">选择您的游戏模式，开始新的对局</p>
        </div>

        <!-- 用户统计 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 text-center">
            <div class="text-3xl font-bold text-blue-400 mb-2">{{ userStore.userElo }}</div>
            <div class="text-slate-400">当前ELO</div>
          </div>
          <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 text-center">
            <div class="text-3xl font-bold text-green-400 mb-2">12</div>
            <div class="text-slate-400">胜场</div>
          </div>
          <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 text-center">
            <div class="text-3xl font-bold text-red-400 mb-2">5</div>
            <div class="text-slate-400">负场</div>
          </div>
          <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 text-center">
            <div class="text-3xl font-bold text-yellow-400 mb-2">70.6%</div>
            <div class="text-slate-400">胜率</div>
          </div>
        </div>

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
            <button @click="handleQuickMatch"
              class="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105">
              开始匹配
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
            <button @click="handleCreateRoom"
              class="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105">
              创建房间
            </button>
          </div>
        </div>

        <!-- 当前房间列表 -->
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

        <!-- 最近对局 -->
        <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <h3 class="text-xl font-bold text-white mb-4">最近对局</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                <span class="text-white font-medium">胜利</span>
                <span class="text-slate-400">vs 玩家ABC</span>
              </div>
              <div class="text-slate-400 text-sm">2小时前</div>
            </div>
            <div class="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-red-400 rounded-full"></div>
                <span class="text-white font-medium">失败</span>
                <span class="text-slate-400">vs 玩家XYZ</span>
              </div>
              <div class="text-slate-400 text-sm">5小时前</div>
            </div>
            <div class="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                <span class="text-white font-medium">胜利</span>
                <span class="text-slate-400">vs 玩家DEF</span>
              </div>
              <div class="text-slate-400 text-sm">1天前</div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-slate-800/30 backdrop-blur border-t border-slate-700 mt-16">
      <div class="container mx-auto px-4 py-8">
        <div class="text-center text-slate-400">
          <p>&copy; 2024 围城游戏平台. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Additional custom styles if needed */
</style>
