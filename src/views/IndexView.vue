<script setup lang="ts">
import HeaderComponent from '@/components/HeaderComponent.vue'
import WelcomeSection from '@/components/WelcomeSection.vue'
import GameLobby from '@/components/GameLobby.vue'
import RoomList from '@/components/RoomList.vue'
import UserStats from '@/components/UserStats.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- Header -->
    <HeaderComponent />

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-12">
      <!-- 未登录用户的欢迎页面 -->
      <div v-if="!userStore.isAuthenticated">
        <WelcomeSection />
      </div>

      <!-- 已登录用户的游戏大厅 -->
      <div v-else class="space-y-8">
        <UserStats />
        <GameLobby />
        <RoomList />
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-slate-800/30 backdrop-blur border-t border-slate-700 mt-16">
      <div class="container mx-auto px-4 py-8">
        <div class="text-center text-slate-400">
          <p>&copy; 2024 围城游戏平台. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Additional custom styles if needed */
</style>
