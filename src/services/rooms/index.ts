import type { AxiosResponse } from 'axios'
import http from '../api'

async function getRoom() {
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

export default {
  getRoom,
  getRoomById,
  createRoom,
  joinRoom,
  leaveRoom,
  reconnect,
}
