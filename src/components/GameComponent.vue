<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import BoardComponent from '@/components/BoardComponent.vue'
// Game state
const gameTime = ref({ blue: 600, green: 600 }) // 10 minutes each

const gameStatus = ref('loading') // loading, matchmaking, playing, finished

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
const chatMessages = ref([
  { player: '玩家1', message: '你好！', time: '14:30' },
  { player: '玩家2', message: '加油！', time: '14:31' },
])
const newMessage = ref('')

// UI state
const showChat = ref(true)
const showMoves = ref(true)

const boardRef = useTemplateRef('board')
const currentPlayer = computed(() => boardRef.value?.blue_turn ? 'blue' : 'green')



const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const sendMessage = () => {
  if (newMessage.value.trim()) {
    chatMessages.value.push({
      player: currentPlayer.value,
      message: newMessage.value,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    })
    newMessage.value = ''
  }
}

const resignGame = () => {
  if (confirm('确定要认输吗？')) {
    gameStatus.value = 'finished'
  }
}

const requestDraw = () => {
  alert('已向对手发送和棋请求')
}

const resetGame = () => {
  boardRef.value?.resetGame()
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-stretch lg:items-start flex-col lg:flex-row w-full gap-6 h-[calc(100vh-120px)]">
      <!-- Left Sidebar - Player Info & Game Controls -->
      <div class="grow gap-4 flex flex-row lg:flex-col">
        <!-- Black Player (Top) -->
        <div class="bg-slate-800/50 backdrop-blur rounded-lg p-4 border grow border-slate-700 transition">
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
            <!-- <button
              class="w-full bg-slate-600 hover:bg-slate-500 text-white py-2 px-3 rounded transition-colors text-sm">
              暂停
            </button> -->
            <button @click="resetGame"
              class="w-full border-1 border-purple-700 hover:bg-purple-700 text-white py-2 px-3 rounded transition-colors text-sm">
              重置
            </button>
          </div>
        </div>

        <!-- White Player (Bottom) -->
        <div class="bg-slate-800/50 backdrop-blur rounded-lg p-4 border grow border-slate-700 transition">
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
      <div class="grow-3 sm:max-w-[calc(100vh-120px)]">
        <div
          class="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 h-full flex items-center justify-center p-2">
          <BoardComponent ref="board" />
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
        <div class="flex-1 bg-slate-800/50 backdrop-blur rounded-b-lg border border-slate-700 border-t-0 flex flex-col">
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
                  class="flex-1 bg-slate-700 text-white placeholder-slate-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                <button @click="sendMessage"
                  class="bg-amber-500 hover:bg-amber-600 text-slate-900 px-3 py-2 rounded text-sm font-medium transition-colors">
                  发送
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
