import { watch, onUnmounted, computed } from 'vue'
import { useWebSocketStore } from '@/stores/websocket'
import { useUserStore } from '@/stores/user'
import type { WebSocketMessage } from '@/stores/websocket'

export function useWebSocket() {
  const webSocketStore = useWebSocketStore()
  const userStore = useUserStore()

  // 监听用户登录状态变化
  const stopWatching = watch(
    () => userStore.isAuthenticated,
    (isAuthenticated) => {
      if (isAuthenticated) {
        // 用户登录后建立WebSocket连接
        webSocketStore.connect()
      } else {
        // 用户登出后断开WebSocket连接
        webSocketStore.disconnect()
      }
    },
    { immediate: true },
  )

  // 添加消息监听器（自动清理）
  const onMessage = (type: string, callback: (data: WebSocketMessage) => void) => {
    webSocketStore.addMessageListener(type, callback)

    // 组件卸载时自动移除监听器
    onUnmounted(() => {
      webSocketStore.removeMessageListener(type, callback)
    })
  }

  // 监听所有消息
  const onAnyMessage = (callback: (data: WebSocketMessage) => void) => {
    onMessage('*', callback)
  }

  // 监听特定类型的消息（支持多个类型）
  const onMessages = (types: string[], callback: (data: WebSocketMessage) => void) => {
    types.forEach((type) => {
      onMessage(type, callback)
    })
  }

  // 一次性消息监听器（收到消息后自动移除）
  const onceMessage = (type: string, callback: (data: WebSocketMessage) => void) => {
    const wrappedCallback = (data: WebSocketMessage) => {
      callback(data)
      webSocketStore.removeMessageListener(type, wrappedCallback)
    }
    webSocketStore.addMessageListener(type, wrappedCallback)

    // 组件卸载时确保移除
    onUnmounted(() => {
      webSocketStore.removeMessageListener(type, wrappedCallback)
    })
  }

  // 组件卸载时停止监听
  onUnmounted(() => {
    stopWatching()
  })

  return {
    // WebSocket状态 - 使用 computed 确保响应式
    status: computed(() => webSocketStore.status),
    isConnected: computed(() => webSocketStore.isConnected),
    isConnecting: computed(() => webSocketStore.isConnecting),
    hasError: computed(() => webSocketStore.hasError),
    lastError: computed(() => webSocketStore.lastError),
    reconnectAttempts: computed(() => webSocketStore.reconnectAttempts),
    maxReconnectAttempts: webSocketStore.maxReconnectAttempts,

    // 消息相关
    lastMessage: computed(() => webSocketStore.lastMessage),
    messageHistory: computed(() => webSocketStore.messageHistory),

    // WebSocket操作
    connect: webSocketStore.connect,
    disconnect: webSocketStore.disconnect,
    reconnect: webSocketStore.reconnect,
    sendMessage: webSocketStore.sendMessage,
    clearError: webSocketStore.clearError,
    clearMessageHistory: webSocketStore.clearMessageHistory,

    // 消息监听
    onMessage,
    onAnyMessage,
    onMessages,
    onceMessage,
  }
}
