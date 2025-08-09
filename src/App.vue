<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useWebSocket } from '@/composables/useWebSocket'

const userStore = useUserStore()
// 初始化WebSocket，监听登录状态变化
useWebSocket()

onMounted(() => {
  // 初始化用户认证状态
  userStore.initializeAuth()
})
</script>

<template>
  <RouterView></RouterView>
</template>
