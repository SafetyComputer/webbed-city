import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './user'

export type WebSocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface WebSocketMessage {
  message_type: string // Chat, Move, Match, End, Join, Leave
  room: number
  [key: string]: unknown
}

export const useWebSocketStore = defineStore('websocket', () => {
  // 状态
  const socket = ref<WebSocket | null>(null)
  const status = ref<WebSocketStatus>('disconnected')
  const lastError = ref<string | null>(null)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = ref(1000) // 初始重连延迟 1 秒

  // 消息相关状态
  const lastMessage = ref<WebSocketMessage | null>(null)
  const messageHistory = ref<Array<WebSocketMessage & { timestamp: Date }>>([])

  // 消息监听器映射
  const messageListeners = ref<Map<string, Array<(data: WebSocketMessage) => void>>>(new Map())

  // 计算属性
  const isConnected = computed(() => status.value === 'connected')
  const isConnecting = computed(() => status.value === 'connecting')
  const hasError = computed(() => status.value === 'error')

  // WebSocket 连接
  function connect() {
    const userStore = useUserStore()

    if (!userStore.isAuthenticated) {
      console.warn('用户未登录，无法建立WebSocket连接')
      return
    }

    if (socket.value?.readyState === WebSocket.OPEN) {
      console.warn('WebSocket已连接')
      return
    }

    status.value = 'connecting'
    lastError.value = null

    try {
      // 这里需要根据实际的WebSocket服务器地址进行配置
      const wsUrl = `wss://${location.host}/ws` // 或者使用环境变量 VITE_WS_URL
      socket.value = new WebSocket(wsUrl)

      socket.value.onopen = () => {
        console.log('WebSocket连接已建立')
        status.value = 'connected'
        reconnectAttempts.value = 0
        reconnectDelay.value = 1000
      }

      socket.value.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          handleMessage(message)
        } catch (error) {
          console.error('解析WebSocket消息失败:', error)
        }
      }

      socket.value.onerror = (error) => {
        console.error('WebSocket错误:', error)
        status.value = 'error'
        lastError.value = 'WebSocket连接错误'
      }

      socket.value.onclose = (event) => {
        console.log('WebSocket连接已关闭:', event.code, event.reason)
        socket.value = null

        if (status.value !== 'error') {
          status.value = 'disconnected'
        }

        // 如果是非正常关闭且用户仍然登录，尝试重连
        if (
          event.code !== 1000 &&
          userStore.isAuthenticated &&
          reconnectAttempts.value < maxReconnectAttempts
        ) {
          attemptReconnect()
        }
      }
    } catch (error) {
      console.error('创建WebSocket连接失败:', error)
      status.value = 'error'
      lastError.value = '无法创建WebSocket连接'
    }
  }

  // 断开连接
  function disconnect() {
    if (socket.value) {
      socket.value.close(1000, '用户主动断开')
      socket.value = null
    }
    status.value = 'disconnected'
    reconnectAttempts.value = 0
  }

  // 重连
  function attemptReconnect() {
    if (reconnectAttempts.value >= maxReconnectAttempts) {
      console.error('达到最大重连次数，停止重连')
      status.value = 'error'
      lastError.value = '连接失败，请刷新页面重试'
      return
    }

    reconnectAttempts.value++
    console.log(`尝试重连 (${reconnectAttempts.value}/${maxReconnectAttempts})`)

    setTimeout(() => {
      if (status.value !== 'connected') {
        connect()
      }
    }, reconnectDelay.value)

    // 指数退避
    reconnectDelay.value = Math.min(reconnectDelay.value * 2, 30000)
  }

  // 发送消息
  function sendMessage(message: WebSocketMessage) {
    if (socket.value?.readyState === WebSocket.OPEN) {
      socket.value.send(JSON.stringify(message))
      return true
    } else {
      console.warn('WebSocket未连接，无法发送消息')
      return false
    }
  }

  // 处理接收到的消息
  function handleMessage(message: WebSocketMessage) {
    // 更新最新消息和历史记录
    lastMessage.value = message
    messageHistory.value.push({
      ...message,
      timestamp: new Date(),
    })

    // 保持历史记录不超过100条
    if (messageHistory.value.length > 100) {
      messageHistory.value.shift()
    }

    // 触发对应类型的监听器
    const listeners = messageListeners.value.get(message.message_type) || []
    listeners.forEach((listener) => {
      try {
        listener(message)
      } catch (error) {
        console.error('消息监听器执行错误:', error)
      }
    })

    // 触发通用监听器
    const allListeners = messageListeners.value.get('*') || []
    allListeners.forEach((listener) => {
      try {
        listener(message)
      } catch (error) {
        console.error('通用消息监听器执行错误:', error)
      }
    })
  }

  // 添加消息监听器
  function addMessageListener(message_type: string, callback: (data: WebSocketMessage) => void) {
    if (!messageListeners.value.has(message_type)) {
      messageListeners.value.set(message_type, [])
    }
    messageListeners.value.get(message_type)!.push(callback)
  }

  // 移除消息监听器
  function removeMessageListener(message_type: string, callback: (data: WebSocketMessage) => void) {
    const listeners = messageListeners.value.get(message_type)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  // 清空指定类型的所有监听器
  function clearMessageListeners(message_type?: string) {
    if (message_type) {
      messageListeners.value.delete(message_type)
    } else {
      messageListeners.value.clear()
    }
  }

  // 清空消息历史
  function clearMessageHistory() {
    messageHistory.value.splice(0)
    lastMessage.value = null
  }

  // 手动重连
  function reconnect() {
    disconnect()
    reconnectAttempts.value = 0
    reconnectDelay.value = 1000
    connect()
  }

  // 清除错误
  function clearError() {
    lastError.value = null
    if (status.value === 'error') {
      status.value = 'disconnected'
    }
  }

  return {
    socket,
    status,
    lastError,
    reconnectAttempts,
    maxReconnectAttempts,
    isConnected,
    isConnecting,
    hasError,
    lastMessage,
    messageHistory,
    connect,
    disconnect,
    reconnect,
    sendMessage,
    clearError,
    addMessageListener,
    removeMessageListener,
    clearMessageListeners,
    clearMessageHistory,
  }
})
