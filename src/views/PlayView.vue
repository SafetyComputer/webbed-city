<script setup lang="ts">
import GameComponent from '@/components/GameComponent.vue'
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- Header -->
    <header class="bg-slate-800/50 backdrop-blur border-b border-slate-700">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <router-link to="/" class="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div class="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <span class="text-slate-900 font-bold text-xl">围</span>
            </div>
            <h1 class="text-xl font-bold text-white">围城</h1>
          </router-link>

          <div class="text-slate-300 text-sm">
            对局中 • 用时赛制
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <button class="text-slate-300 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </button>

          <router-link to="/" class="text-slate-300 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </router-link>
        </div>
      </div>
    </header>

    <GameComponent></GameComponent>
  </div>
</template>

<style scoped>
/* Custom scrollbar for better appearance */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #334155;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #64748b;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
