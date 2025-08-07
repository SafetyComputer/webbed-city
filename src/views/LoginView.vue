<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { API } from '@/services'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = '请填写所有必填字段'
    return
  }

  isLoading.value = true
  errorMessage.value = ''


  const inputLogin = {
    username: username.value,
    password: password.value
  }

  await API.users.login(inputLogin)
    .then(async (res) => {
      if (res.data === 'success') {
        // 获取用户信息

        await API.users.getUser({ username: username.value })
          .then((res) => {
            const userData = res.data[0]
            userStore.login(userData)
            router.push('/')
          })
          .catch((err) => {
            errorMessage.value = '获取用户信息失败，请稍后重试'
          })
      }
    })
    .catch((err) => {
      if (err.response) {
        if (err.response.data === "login info error") {
          errorMessage.value = '用户名或密码错误'
        } else if (err.response.data === "already logged in") {
          errorMessage.value = '您已登录，请先退出当前账户'
          router.push('/')
        } else {
          errorMessage.value = '登录失败，请稍后重试'
        }
      } else {
        errorMessage.value = '网络错误，请检查您的连接'
      }
    })
    .finally(() => {
      isLoading.value = false
    })
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <RouterLink to="/" class="inline-flex items-center space-x-2 text-white hover:text-blue-400 transition-colors">
          <img src="/icon.png" alt="围城 Logo" class="w-8 h-8 rounded-lg" />
          <h1 class="text-2xl font-bold">围城</h1>
        </RouterLink>
        <h2 class="text-3xl font-bold text-white mt-6 mb-2">欢迎回来</h2>
        <p class="text-slate-400">登录您的账户继续游戏</p>
      </div>

      <!-- Login Form -->
      <div class="bg-slate-800/50 backdrop-blur rounded-xl p-8 border border-slate-700">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Username Field -->
          <div>
            <label for="username" class="block text-sm font-medium text-slate-300 mb-2">
              用户名
            </label>
            <input id="username" v-model="username" type="text" required
              class="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="输入您的用户名" />
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-slate-300 mb-2">
              密码
            </label>
            <input id="password" v-model="password" type="password" required
              class="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="输入您的密码" />
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p class="text-red-400 text-sm">{{ errorMessage }}</p>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input type="checkbox" class="rounded border-slate-600 text-blue-500 focus:ring-blue-500">
              <span class="ml-2 text-sm text-slate-300">记住我</span>
            </label>
            <a href="#" class="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              忘记密码？
            </a>
          </div>

          <!-- Login Button -->
          <button type="submit" :disabled="isLoading"
            class="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed">
            <span v-if="isLoading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              登录中...
            </span>
            <span v-else>登录</span>
          </button>

          <!-- Social Login -->
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-600"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-slate-800/50 text-slate-400">或</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button type="button"
              class="flex justify-center items-center px-4 py-2 border border-slate-600 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-colors">
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </button>
            <button type="button"
              class="flex justify-center items-center px-4 py-2 border border-slate-600 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-colors">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </button>
          </div>
        </form>

        <!-- Register Link -->
        <div class="mt-6 text-center">
          <p class="text-slate-400">
            还没有账户？
            <RouterLink to="/register" class="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              立即注册
            </RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
