<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- Header -->
    <header class="bg-slate-800/50 backdrop-blur border-b border-slate-700">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <RouterLink to="/" class="text-blue-400 hover:text-blue-300 transition-colors">
            ← 返回首页
          </RouterLink>
          <h1 class="text-2xl font-bold text-white ml-4">WebSocket 测试</h1>
        </div>

        <!-- WebSocket状态显示 -->
        <WebSocketStatus />
      </div>
    </header>

    <main class="container mx-auto px-4 py-8">
      <div class="grid lg:grid-cols-2 gap-8">
        <!-- 左侧：连接控制和发送消息 -->
        <div class="space-y-6">
          <!-- 连接控制 -->
          <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h2 class="text-xl font-bold text-white mb-4">连接控制</h2>

            <div class="space-y-4">

              <!-- 连接信息 -->
              <div v-if="reconnectAttempts > 0" class="text-sm text-slate-400">
                重连尝试: {{ reconnectAttempts }}/{{ maxReconnectAttempts }}
              </div>

              <div v-if="lastError" class="text-sm text-red-400">
                错误: {{ lastError }}
              </div>

              <!-- 控制按钮 -->
              <div class="flex space-x-3">
                <button @click="handleConnect" :disabled="isConnected || isConnecting"
                  class="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors">
                  连接
                </button>
                <button @click="handleDisconnect" :disabled="!isConnected"
                  class="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors">
                  断开
                </button>
                <button @click="handleReconnect"
                  class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                  重连
                </button>
                <button @click="handleClearError" v-if="hasError"
                  class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors">
                  清除错误
                </button>
              </div>
            </div>
          </div>

          <!-- 发送消息 -->
          <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h2 class="text-xl font-bold text-white mb-4">发送消息</h2>

            <div class="space-y-4">
              <!-- 消息类型 -->
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">消息类型</label>
                <select v-model="messageType"
                  class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="chat">聊天消息</option>
                  <option value="ping">心跳包</option>
                  <option value="game_action">游戏动作</option>
                  <option value="test">测试消息</option>
                  <option value="custom">自定义</option>
                </select>
              </div>

              <!-- 自定义类型输入 -->
              <div v-if="messageType === 'custom'">
                <label class="block text-sm font-medium text-slate-300 mb-2">自定义类型</label>
                <input v-model="customType" type="text"
                  class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入消息类型" />
              </div>

              <!-- 消息内容 -->
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">消息内容 (JSON)</label>
                <textarea v-model="messageContent" rows="4"
                  class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder='{"message": "Hello World"}'></textarea>
              </div>

              <!-- 发送按钮 -->
              <button @click="sendTestMessage" :disabled="!isConnected"
                class="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors">
                {{ isConnected ? '发送消息' : '请先连接WebSocket' }}
              </button>

              <!-- 快速发送按钮 -->
              <div class="flex space-x-2">
                <button @click="sendQuickMessage('ping')" :disabled="!isConnected"
                  class="flex-1 px-3 py-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white text-sm rounded transition-colors">
                  发送Ping
                </button>
                <button @click="sendQuickMessage('test')" :disabled="!isConnected"
                  class="flex-1 px-3 py-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 text-white text-sm rounded transition-colors">
                  发送测试
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：消息历史和监听器状态 -->
        <div class="space-y-6">
          <!-- 最新消息 -->
          <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h2 class="text-xl font-bold text-white mb-4">最新消息</h2>

            <div v-if="lastMessage" class="space-y-2">
              <div class="text-sm text-slate-400">
                类型: <span class="text-blue-400">{{ lastMessage.type }}</span>
              </div>
              <div class="text-sm text-slate-400">
                时间: <span class="text-green-400">{{ formatTime((lastMessage as any).timestamp) }}</span>
              </div>
              <pre
                class="bg-slate-900 p-3 rounded text-sm text-green-400 overflow-auto">{{ JSON.stringify(lastMessage, null, 2) }}</pre>
            </div>

            <div v-else class="text-slate-400 text-center py-4">
              暂无消息
            </div>
          </div>

          <!-- 消息历史 -->
          <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-white">消息历史</h2>
              <button @click="clearHistory"
                class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors">
                清空历史
              </button>
            </div>

            <div class="max-h-64 overflow-y-auto space-y-2">
              <div v-for="(message, index) in messageHistory" :key="index" class="p-3 bg-slate-700/50 rounded text-sm">
                <div class="flex justify-between items-start mb-1">
                  <span class="text-blue-400 font-medium">{{ message.type }}</span>
                  <span class="text-slate-400 text-xs">{{ formatTime(message.timestamp) }}</span>
                </div>
                <pre class="text-green-400 text-xs overflow-auto">{{ JSON.stringify(message, null, 2) }}</pre>
              </div>
            </div>

            <div v-if="messageHistory.length === 0" class="text-slate-400 text-center py-4">
              暂无消息历史
            </div>
          </div>

          <!-- 监听器状态 -->
          <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h2 class="text-xl font-bold text-white mb-4">消息监听器</h2>

            <div class="space-y-3">
              <div v-for="listener in activeListeners" :key="listener.type" class="flex justify-between items-center">
                <span class="text-slate-300">{{ listener.type }}</span>
                <span class="text-green-400 text-sm">{{ listener.count }} 个监听器</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useWebSocket } from '@/composables/useWebSocket'
import WebSocketStatus from '@/components/WebSocketStatus.vue'

const {
  isConnected,
  isConnecting,
  hasError,
  lastError,
  reconnectAttempts,
  maxReconnectAttempts,
  lastMessage,
  messageHistory,
  connect,
  disconnect,
  reconnect,
  sendMessage,
  clearError,
  clearMessageHistory,
} = useWebSocket()

// 表单数据
const messageType = ref('test')
const customType = ref('')
const messageContent = ref('{"message": "Hello World", "timestamp": "' + new Date().toISOString() + '"}')

// 监听器统计
const activeListeners = ref<Array<{ type: string; count: number }>>([])


// 时间格式化
const formatTime = (timestamp: Date | string | number) => {
  if (!timestamp) return ''
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
  return date.toLocaleTimeString()
}

// 发送测试消息
const sendTestMessage = () => {
  try {
    const type = messageType.value === 'custom' ? customType.value : messageType.value
    const content = messageContent.value ? JSON.parse(messageContent.value) : {}

    const success = sendMessage({
      type,
      ...content
    })

    if (success) {
      console.log('消息已发送:', { type, ...content })
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    alert('消息格式错误，请检查JSON格式')
  }
}

// 快速发送消息
const sendQuickMessage = (type: string) => {
  const messages = {
    ping: { type: 'ping', timestamp: Date.now() },
    test: { type: 'test', message: 'Quick test message', timestamp: Date.now() }
  }

  const message = messages[type as keyof typeof messages]
  if (message) {
    sendMessage(message)
  }
}

// 控制函数
const handleConnect = () => {
  connect()
}

const handleDisconnect = () => {
  disconnect()
}

const handleReconnect = () => {
  reconnect()
}

const handleClearError = () => {
  clearError()
}

const clearHistory = () => {
  clearMessageHistory()
}

// 设置消息监听器
onMounted(() => {

  // 更新监听器统计（这里简化显示）
  activeListeners.value = [
    { type: '*', count: 1 },
    { type: 'ping', count: 1 },
    { type: 'pong', count: 1 },
    { type: 'test', count: 1 }
  ]
})
</script>

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
</style>
