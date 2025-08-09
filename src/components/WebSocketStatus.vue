<script setup lang="ts">
import { useWebSocket } from '@/composables/useWebSocket'

const {
  status,
  isConnected,
  isConnecting,
  hasError,
  lastError,
  reconnectAttempts,
  maxReconnectAttempts,
  reconnect,
  clearError
} = useWebSocket()

const handleReconnect = () => {
  clearError()
  reconnect()
}
</script>

<template>
  <div class="flex items-center space-x-2 text-sm">
    <!-- 连接状态指示器 -->
    <div class="flex items-center space-x-2">
      <!-- 状态点 -->
      <div class="w-2 h-2 rounded-full transition-colors" :class="{
        'bg-green-400': isConnected,
        'bg-yellow-400 animate-pulse': isConnecting,
        'bg-red-400': hasError,
        'bg-gray-400': status === 'disconnected'
      }"></div>

      <!-- 状态文本 -->
      <span class="font-medium transition-colors" :class="{
        'text-green-400': isConnected,
        'text-yellow-400': isConnecting,
        'text-red-400': hasError,
        'text-gray-400': status === 'disconnected'
      }">
        <template v-if="isConnected">已连接</template>
        <template v-else-if="isConnecting">连接中</template>
        <template v-else-if="hasError">连接错误</template>
        <template v-else>未连接</template>
      </span>
    </div>

    <!-- 重连信息 -->
    <template v-if="isConnecting && reconnectAttempts > 0">
      <span class="text-gray-400">
        (重连 {{ reconnectAttempts }}/{{ maxReconnectAttempts }})
      </span>
    </template>

    <!-- 错误信息和重连按钮 -->
    <template v-if="hasError">
      <div class="flex items-center space-x-2">
        <span class="text-red-400 text-xs" v-if="lastError">
          {{ lastError }}
        </span>
        <button @click="handleReconnect" class="text-blue-400 hover:text-blue-300 text-xs underline transition-colors">
          重连
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
