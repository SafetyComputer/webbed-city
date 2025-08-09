import type { ServerMessage } from './types'

function establishWebSocketConnection(): WebSocket {
  const socket = new WebSocket(`wss://localhost/api/ws`)

  socket.onopen = () => {
    console.log('WebSocket connection established')
  }

  socket.onclose = () => {
    console.log('WebSocket connection closed')
  }

  socket.onerror = (error) => {
    console.error('WebSocket error:', error)
  }

  return socket
}

function processWebSocketMessage(messageHandler: (msg: ServerMessage) => void) {
  function handleMessage(message: string) {
    let parsedMessage: ServerMessage
    try {
      parsedMessage = JSON.parse(message)
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
      return
    }

    if (parsedMessage && parsedMessage.command) {
      messageHandler(parsedMessage)
    } else {
      console.warn('Received invalid WebSocket message:', parsedMessage)
    }
  }
  return handleMessage
}

export default {
  establishWebSocketConnection,
  processWebSocketMessage,
}
