import http from '../api'
import type { InputCreateUser, InputLogin, UserFilter } from './types'

async function createUser(input: InputCreateUser) {
  return await http.post('/user', input)
}

async function getUser(params: UserFilter = {}) {
  return await http.get('/user', { params: params })
}

async function getUserById(id: number) {
  return await http.get(`/user`, { params: { id } })
}

async function getUserByUsername(username: string) {
  return await http.get(`/user`, { params: { username } })
}

async function getUserSelf() {
  return await http.get('/user/self')
}

async function login(input: InputLogin) {
  return await http.post('/login', input)
}

async function logout() {
  return await http.post('/logout')
}

export default {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
  getUserSelf,
  login,
  logout,
}
