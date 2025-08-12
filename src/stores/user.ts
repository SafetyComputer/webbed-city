import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/services/users/types'

const USER_STORAGE_KEY = 'webbed_city_user'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)

  // 计算属性
  const userDisplayName = computed(() => user.value?.username || '游客')
  const userElo = computed(() => user.value?.elo || 0)
  const userId = computed(() => user.value?.id || null)

  // 操作
  function setUser(userData: User) {
    user.value = userData
    isAuthenticated.value = true
    // 保存用户信息到本地存储
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))
  }

  function login(userData: User) {
    setUser(userData)
  }

  function logout() {
    user.value = null
    isAuthenticated.value = false
    // 清除本地存储的用户信息
    localStorage.removeItem(USER_STORAGE_KEY)
  }

  function updateUser(userData: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...userData }
      // 更新本地存储
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user.value))
    }
  }

  function initializeAuth() {
    // 从本地存储恢复用户信息
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY)
      if (savedUser) {
        const userData = JSON.parse(savedUser) as User
        user.value = userData
        isAuthenticated.value = true
      }
    } catch (error) {
      console.error('Failed to restore user from localStorage:', error)
      // 如果解析失败，清除损坏的数据
      localStorage.removeItem(USER_STORAGE_KEY)
    }
  }

  return {
    user,
    isAuthenticated,
    userId,
    userDisplayName,
    userElo,
    setUser,
    login,
    logout,
    updateUser,
    initializeAuth,
  }
})
