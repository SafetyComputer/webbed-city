import type { SerializedMove } from './types'
import http from '../api'

async function getRooms() {
  return await http.get('/room')
}

async function getRoomById(room_id: number) {
  return await http.get('/room', { params: { room_id } })
}

async function createRoom() {
  return await http.post('/room')
}

async function joinRoom(room_id: number, join_as: 'player' | 'viewer') {
  return await http.patch(`/room/join/${join_as}`, { room_id })
}

async function leaveRoom(room_id: number) {
  return await http.patch('/room/leave', { room_id })
}

async function reconnect() {
  return await http.get('/reconnect')
}

async function makeMove(room_id: number, move: SerializedMove) {
  return await http.post('/room/move', { room_id, mv: move })
}

async function sendChatMessage(room_id: number, message: string) {
  return await http.post('/room/chat', { room_id, message })
}

export default {
  getRooms,
  getRoomById,
  createRoom,
  joinRoom,
  leaveRoom,
  reconnect,
  makeMove,
  sendChatMessage,
}
