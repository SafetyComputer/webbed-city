<template>
  <!-- 欢迎用户 -->
  <div class="text-center space-y-4">
    <h2 class="text-4xl font-bold text-white">
      欢迎回来，<span class="text-blue-400">{{ userStore.userDisplayName }}</span>！
    </h2>
    <p class="text-slate-300 text-lg">选择您的游戏模式，开始新的对局</p>
  </div>

  <!-- 用户统计 -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
    <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 text-center">
      <div class="text-3xl font-bold text-blue-400 mb-2">{{ userStore.userElo }}</div>
      <div class="text-slate-400">当前ELO</div>
    </div>
    <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 text-center">
      <div class="text-3xl font-bold text-green-400 mb-2">12</div>
      <div class="text-slate-400">胜场</div>
    </div>
    <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 text-center">
      <div class="text-3xl font-bold text-red-400 mb-2">5</div>
      <div class="text-slate-400">负场</div>
    </div>
    <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 text-center">
      <div class="text-3xl font-bold text-yellow-400 mb-2">70.6%</div>
      <div class="text-slate-400">胜率</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>
