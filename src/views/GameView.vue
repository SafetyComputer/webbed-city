<script setup lang="ts">
import { computed, ref, useTemplateRef, onMounted, onUnmounted, watch } from 'vue'
import BoardComponent from '@/components/BoardComponent.vue'
import { API } from '@/services'
import router from '@/router'
import { useUserStore } from '@/stores/user'
import { base64ToNumber } from '@/utils/base64'
import type { WebSocketMessage } from '@/stores/websocket'
import { useWebSocket } from '@/composables/useWebSocket'


const userStore = useUserStore()
const { isConnected, onMessage, lastMessage } = useWebSocket()
const roomId = ref(base64ToNumber(router.currentRoute.value.params.room_id))
const role = ref(router.currentRoute.value.query.spectator ? 'viewer' : 'player')
const color = ref('') // green, blue

// Game state
const gameTime = ref({ blue: 600, green: 600 }) // 10 minutes each
const gameStatus = ref('loading') // loading, waiting, playing, finished


// Current URL for sharing
const currentUrl = ref(window.location.href)

const gameResult = ref<{ winner: 'blue' | 'green' | 'draw', reason: string, score: { blue: number, green: number } } | null>(null)
const showGameResult = ref(false)


// Timer state
const timerInterval = ref<number | null>(null)


const joinRoom = async () => {
  await API.rooms.joinRoom(roomId.value, role.value)
    .then(() => {
      if (gameStatus.value === 'loading') {
        gameStatus.value = 'waiting'
      }
    })
    .catch(err => {
      console.error('加入房间失败:', err)
      alert('加入房间失败，请稍后再试')
    })

  if (lastMessage.value && lastMessage.value.message_type === 'Match' && lastMessage.value.room === roomId.value) {
    const data = JSON.parse(lastMessage.value.data)
    if (data.player_blue && data.player_green) {
      gameStatus.value = 'playing'
      fetchPlayerData(data.player_blue, data.player_green)

      if (userStore.userId === data.player_blue) {
        color.value = 'blue'
      } else if (userStore.userId === data.player_green) {
        color.value = 'green'
      }
    }
  }
}

// Players info
const players = ref({
  blue: {
    name: '玩家1',
    rating: 1200,
    avatar: '👤',
    online: true,
  },
  green: {
    name: '玩家2',
    rating: 1150,
    avatar: '👤',
    online: true,
  },
})

// Chat
const chatMessages = ref<Array<{ player: string, message: string, time: string }>>([])
const newMessage = ref('')

// UI state
const showChat = ref(true)
const showMoves = ref(true)

const boardRef = useTemplateRef('board')
const currentPlayer = computed(() => boardRef.value?.blue_turn ? 'blue' : 'green')

// Timer functions
const startTimer = () => {
  if (timerInterval.value) return // 已经在运行

  timerInterval.value = window.setInterval(() => {
    // 只有在游戏开始后才计时（有棋步记录且游戏未结束）
    const hasStarted = boardRef.value?.history && boardRef.value.history.length > 0
    const isGameOver = gameStatus.value === 'finished'

    if (!hasStarted || isGameOver) return

    const player = currentPlayer.value
    if (gameTime.value[player] > 0) {
      gameTime.value[player]--

      // 时间用完，游戏结束
      if (gameTime.value[player] === 0) {
        gameStatus.value = 'finished'
        gameResult.value = {
          winner: player === 'blue' ? 'green' : 'blue',
          reason: '时间耗尽',
          score: { blue: 0, green: 0 }
        }
        showGameResult.value = true
        stopTimer()
      }
    }
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

const resetTimer = () => {
  stopTimer()
  gameTime.value = { blue: 600, green: 600 }
  gameStatus.value = 'playing'
  // 重新启动计时器
  startTimer()
}

// 监听游戏状态变化
onMounted(() => {
  startTimer()
  if (isConnected.value) {
    joinRoom()
  }
})

onUnmounted(() => {
  stopTimer()
})


watch(() => isConnected.value, (status) => {
  if (status) {
    joinRoom()
  }
})


const fetchPlayerData = async (blue_id: number, green_id: number) => {
  await API.users.getUserById(blue_id)
    .then(response => {
      players.value.blue = {
        name: response.data[0].username,
        rating: response.data[0].elo,
        avatar: '👤',
        online: true,
      }
    })
    .catch(err => {
      console.error('获取蓝方玩家信息失败:', err)
    })

  await API.users.getUserById(green_id)
    .then(response => {
      players.value.green = {
        name: response.data[0].username,
        rating: response.data[0].elo,
        avatar: '👤',
        online: true,
      }
    })
    .catch(err => {
      console.error('获取绿方玩家信息失败:', err)
    })
}

onMessage('Match', (msg: WebSocketMessage) => {
  console.log(msg)
  if (gameStatus.value === 'playing') return
  const data = JSON.parse(msg.data)
  if (msg.room === roomId.value && data.player_blue && data.player_green) {
    gameStatus.value = 'playing'
    fetchPlayerData(data.player_blue, data.player_green)

    if (userStore.userId === data.player_blue) {
      color.value = 'blue'
    } else if (userStore.userId === data.player_green) {
      color.value = 'green'
    }
    startTimer()
  }
})

// 监听棋盘游戏结束状态
watch(() => boardRef.value?.game_over, (isGameOver) => {
  if (isGameOver && gameStatus.value !== 'finished') {
    gameStatus.value = 'finished'
    showGameResult.value = true
    gameResult.value = {
      winner: boardRef.value?.game_result?.winner.toLowerCase(),
      reason: '正常结束',
      score: {
        blue: boardRef.value?.game_result?.score.blue || 0,
        green: boardRef.value?.game_result?.score.green || 0
      }
    }
    stopTimer()
  }
}, { deep: true })



const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const sendMessage = () => {
  API.rooms.sendChatMessage(roomId.value, newMessage.value)
    .then(() => {
      newMessage.value = ''
    })
    .catch(err => {
      console.error('发送消息失败:', err)
      alert('发送消息失败，请稍后再试')
    })
}

onMessage('Chat', (msg: WebSocketMessage) => {
  if (msg.room !== roomId.value) return

  const chat: string = msg.data
  chatMessages.value.push({
    player: chat.split(':')[0],
    message: chat.split(':')[1].trim(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })
})

const resignGame = () => {
  if (confirm('确定要认输吗？')) {
    gameStatus.value = 'finished'
    gameResult.value = {
      winner: currentPlayer.value === 'blue' ? 'green' : 'blue',
      reason: '认输',
      score: { blue: 0, green: 0 }
    }
    showGameResult.value = true
  }
}

const requestDraw = () => {
  alert('已向对手发送和棋请求')
}

const resetGame = () => {
  boardRef.value?.resetGame()
  resetTimer()
}

const leaveRoom = async () => {
  if (confirm('确定要离开房间吗？')) {
    await API.rooms.leaveRoom(roomId.value)
      .then(() => {
        router.push('/')
      })
      .catch(err => {
        console.error('离开房间失败:', err)
        alert('离开房间失败，请稍后再试')
      })
  }
}

const closeGameResult = () => {
  showGameResult.value = false
}

const newGame = () => {
  showGameResult.value = false
  resetGame()
}

const copyInviteLink = () => {
  navigator.clipboard.writeText(currentUrl.value).then(() => {
    alert('邀请链接已复制到剪贴板')
  }).catch(err => {
    console.error('复制失败:', err)
    alert('复制链接失败，请手动复制')
  })
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- Header -->
    <header class="bg-slate-800/50 backdrop-blur border-b border-slate-700">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <router-link to="/" class="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img src="/icon.png" alt="围城 Logo" class="w-8 h-8 rounded-lg" />
            <h1 class="text-xl font-bold text-white">围城</h1>
          </router-link>

          <div class="text-slate-300 text-sm">
            <span class="text-blue-400">对局中</span> • <span class="text-green-400">用时赛制</span>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <button class="text-slate-300 hover:text-blue-400 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
              </path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </button>

          <router-link to="/" class="text-slate-300 hover:text-green-400 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </router-link>
        </div>
      </div>
    </header>

    <main class="overflow-y-scroll lg:overflow-hidden">
      <!-- 等待玩家弹窗 -->
      <div v-if="gameStatus === 'waiting'"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center max-w-md mx-4">
          <div class="mb-6">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <div class="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">正在等待玩家</h3>
            <p class="text-slate-400">请稍等，正在等待玩家加入房间...</p>
          </div>
          <div class="flex items-center space-x-2 mb-4">
            <input :value="currentUrl" readonly
              class="flex-1 bg-slate-700 text-white px-3 py-2 rounded text-sm focus:outline-none" placeholder="邀请链接" />
            <button @click="copyInviteLink"
              class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap">
              复制链接
            </button>
          </div>
          <button @click="leaveRoom"
            class="w-full bg-slate-600 hover:bg-slate-500 text-white py-2 px-4 rounded transition-colors">
            离开房间
          </button>
        </div>
      </div>

      <transition>
        <!-- 游戏结果弹窗 -->
        <div v-if="showGameResult && gameResult" class="fixed top-0 left-0 right-0 z-50 flex justify-center pt-8">
          <div
            class="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center max-w-md w-100 mx-4 shadow-xl transition">
            <div class="mb-4">
              <div class="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" :class="{
                'bg-green-500/20': gameResult.winner === 'green',
                'bg-blue-500/20': gameResult.winner === 'blue',
                'bg-slate-500/20': gameResult.winner === 'draw'
              }">
                <div class="text-2xl">
                  {{ gameResult.winner === 'blue' ? '🔵' : gameResult.winner === 'green' ? '🟢' : '⚪️'
                  }}
                </div>
              </div>
              <h3 class="text-lg font-semibold text-white mb-2">游戏结束</h3>
              <p class="text-slate-300 mb-1">
                {{ gameResult.winner === 'draw' ? '平局' : gameResult.winner === 'blue' ? '蓝方获胜' : '绿方获胜' }}
              </p>
              <p class="text-slate-400 text-sm">{{ gameResult.reason === '正常结束' ? `${gameResult.score.blue} -
                ${gameResult.score.green}` : gameResult.reason }}</p>
            </div>
            <div class="flex space-x-3">
              <button @click="closeGameResult"
                class="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 px-4 rounded transition-colors text-sm">
                关闭
              </button>
              <button @click="newGame"
                class="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 py-2 px-4 rounded transition-colors text-sm font-medium">
                新游戏
              </button>
            </div>
          </div>
        </div>
      </transition>
      <div class="container mx-auto px-4 py-6">
        <div
          class="flex items-stretch lg:items-start flex-col lg:flex-row w-full gap-6 h-[calc(100vh-120px)] lg:grid lg:grid-cols-4">
          <!-- Left Sidebar - Player Info & Game Controls -->
          <div class=" gap-4 grid grid-cols-3 lg:flex lg:flex-col">
            <!-- Black Player (Top) -->
            <div class="bg-slate-800/50 backdrop-blur rounded-lg p-4 border  border-slate-700 transition">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-lg">
                    {{ players.blue.avatar }}
                  </div>
                  <div>
                    <div class="text-white font-semibold">{{ players.blue.name }}</div>
                    <div class="text-slate-400 text-sm">{{ players.blue.rating }}</div>
                  </div>
                </div>
                <div :class="[
                  'w-3 h-3 rounded-full',
                  players.blue.online ? 'bg-green-400' : 'bg-slate-600',
                ]"></div>
              </div>
              <div class="bg-sky-500/20 rounded p-2 text-center transition"
                :class="{ 'bg-sky-500/50': boardRef?.blue_turn }">
                <div class="text-2xl font-mono text-white">{{ formatTime(gameTime.blue) }}</div>
              </div>
            </div>

            <!-- Game Controls -->
            <div class="bg-slate-800/50 backdrop-blur rounded-lg p-4 border border-slate-700">
              <h3 class="text-white font-semibold mb-3">游戏操作</h3>
              <div class="space-y-2 ">
                <button @click="requestDraw"
                  class="w-full border-1 border-emerald-600 hover:bg-emerald-600  text-white py-2 px-3 rounded transition-colors text-sm">
                  请求和棋
                </button>
                <button @click="resignGame"
                  class="w-full border-1 border-blue-700 hover:bg-blue-700 text-white py-2 px-3 rounded transition-colors text-sm">
                  认输
                </button>

                <button @click="resetGame"
                  class="w-full border-1 border-purple-700 hover:bg-purple-700 text-white py-2 px-3 rounded transition-colors text-sm">
                  重置
                </button>
                <!-- 测试匹配状态按钮 -->
                <button @click="gameStatus = 'waiting'"
                  class="w-full border-1 border-amber-600 hover:bg-amber-600 text-white py-2 px-3 rounded transition-colors text-sm">
                  测试匹配
                </button>
                <!-- 测试游戏结束按钮 -->
                <button
                  @click="gameResult = { winner: 'blue', reason: '测试结束', score: { blue: 1, green: 0 } }; showGameResult = true; gameStatus = 'finished'"
                  class="w-full border-1 border-cyan-600 hover:bg-cyan-600 text-white py-2 px-3 rounded transition-colors text-sm">
                  测试结束
                </button>
              </div>
            </div>

            <!-- White Player (Bottom) -->
            <div class="bg-slate-800/50 backdrop-blur rounded-lg p-4 border border-slate-700 transition">
              <div class="bg-emerald-500/20 rounded p-2 text-center mb-3"
                :class="{ 'bg-emerald-500/50': !boardRef?.blue_turn }">
                <div class="text-2xl font-mono text-white">{{ formatTime(gameTime.green) }}</div>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-lg">
                    {{ players.green.avatar }}
                  </div>
                  <div>
                    <div class="text-white font-semibold">{{ players.green.name }}</div>
                    <div class="text-slate-400 text-sm">{{ players.green.rating }}</div>
                  </div>
                </div>
                <div :class="[
                  'w-3 h-3 rounded-full',
                  players.green.online ? 'bg-green-400' : 'bg-slate-600',
                ]"></div>
              </div>
            </div>
          </div>

          <!-- Center - Game Board -->
          <div class="grow-3 sm:max-w-[calc(100vh-120px)] col-span-2">
            <div
              class="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 h-full flex items-center justify-center p-2">
              <BoardComponent ref="board" :color="color" :room-id="roomId" />
            </div>
          </div>

          <!-- Right Sidebar - Moves & Chat -->
          <div class="grow flex flex-col h-full">
            <!-- Tab Headers -->
            <div class="flex bg-slate-800/50 backdrop-blur rounded-t-lg border border-slate-700 border-b-0">
              <button @click="showMoves = !showMoves
                " :class="[
                  'flex-1 py-3 px-4 text-sm font-medium transition-colors',
                  showMoves ? 'text-white bg-slate-700' : 'text-slate-400 hover:text-white',
                ]">
                着法记录
              </button>
              <button @click="
                showChat = !showChat
                " :class="[
                  'flex-1 py-3 px-4 text-sm font-medium transition-colors',
                  showChat ? 'text-white bg-slate-700' : 'text-slate-400 hover:text-white',
                ]">
                聊天
              </button>
            </div>

            <!-- Tab Content -->
            <div
              class="flex-1 bg-slate-800/50 backdrop-blur rounded-b-lg border border-slate-700 border-t-0 flex flex-col">
              <!-- Move History -->
              <div v-if="showMoves" class="flex-1 flex justify-between flex-col">
                <div class="grid grid-cols-2 gap-4 p-4 overflow-y-auto">
                  <div v-for="(move, index) in boardRef?.history" :key="index"
                    class="flex justify-center items-center text-md font-mono font-bold gap-8">
                    <span v-if="index % 2 === 0" class="text-slate-300">{{ (index + 2) / 2 }}.</span>
                    <span class="text-white">
                      {{ String.fromCharCode(move.destination.x + 97) + (move.destination.y + 1).toString() +
                        move.place_wall.toString()[0] }}
                    </span>
                  </div>
                </div>
                <div class="flex flex-row border-t border-slate-700">
                  <button
                    class="text-slate-400 hover:text-white hover:bg-slate-700 flex-1 py-3 px-4 text-sm font-medium transition-colors text-center">
                    开始
                  </button>
                  <button
                    class="text-slate-400 hover:text-white hover:bg-slate-700 flex-1 py-3 px-4 text-sm font-medium transition-colors text-center">
                    上一步</button>
                  <button
                    class="text-slate-400 hover:text-white hover:bg-slate-700 flex-1 py-3 px-4 text-sm font-medium transition-colors text-center">
                    下一步</button>
                  <button
                    class="text-slate-400 hover:text-white hover:bg-slate-700 flex-1 py-3 px-4 text-sm font-medium transition-colors text-center">
                    结束</button>
                </div>
              </div>

              <!-- Chat -->
              <div v-if="showChat" class="flex-1 flex flex-col">
                <!-- Messages -->
                <div class="flex-1 p-4 overflow-y-auto space-y-3 border-t border-slate-700">
                  <div v-for="(msg, index) in chatMessages" :key="index" class="flex flex-col space-y-1">
                    <div class="flex items-center space-x-2">
                      <span :class="[
                        'text-xs font-medium',
                        msg.player === 'white' ? 'text-white' : 'text-slate-300',
                      ]">
                        {{ msg.player }}
                      </span>
                      <span class="text-slate-500 text-xs">{{ msg.time }}</span>
                    </div>
                    <div class="text-slate-300 text-sm bg-slate-700/50 rounded p-2">
                      {{ msg.message }}
                    </div>
                  </div>
                </div>

                <!-- Chat Input -->
                <div class="p-4 border-t border-slate-700">
                  <div class="flex space-x-2">
                    <input v-model="newMessage" @keyup.enter="sendMessage" type="text" placeholder="输入消息..."
                      class="flex-1 bg-slate-700 text-white placeholder-slate-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/80 min-w-0" />
                    <button @click="sendMessage" :disabled="!newMessage.trim()"
                      class="bg-violet-400/80 hover:bg-violet-500/80 text-slate-900 px-3 py-2 rounded text-sm font-medium transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
                      发送
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1e293b;
}

::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
