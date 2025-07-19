<script setup lang="ts">
import { ref } from 'vue'

const gameDescription = ref(`
围城是一个策略性双人对弈游戏，玩家需要通过巧妙的布局和移动来包围对手的棋子。
游戏规则简单易学，但策略深度丰富，适合所有年龄段的玩家。
`)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- Header -->
    <header class="bg-slate-800/50 backdrop-blur border-b border-slate-700">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <span class="text-slate-900 font-bold text-xl">围</span>
          </div>
          <h1 class="text-2xl font-bold text-white">围城</h1>
        </div>
        <button
          class="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            ></path>
          </svg>
          <span>个人中心</span>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-12">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Left Side - Game Info -->
        <div class="space-y-8">
          <div>
            <h2 class="text-5xl font-bold text-white mb-4">
              开始你的
              <span class="text-amber-400">围城</span>
              之旅
            </h2>
            <p class="text-slate-300 text-lg leading-relaxed">
              {{ gameDescription }}
            </p>
          </div>

          <!-- Game Stats -->
          <div class="grid grid-cols-3 gap-4">
            <div class="bg-slate-800/50 backdrop-blur rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-amber-400">1,234</div>
              <div class="text-slate-400 text-sm">在线玩家</div>
            </div>
            <div class="bg-slate-800/50 backdrop-blur rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-green-400">5,678</div>
              <div class="text-slate-400 text-sm">今日对局</div>
            </div>
            <div class="bg-slate-800/50 backdrop-blur rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-blue-400">98.5%</div>
              <div class="text-slate-400 text-sm">在线率</div>
            </div>
          </div>
        </div>

        <!-- Right Side - Game Mode Selection -->
        <div class="space-y-6">
          <h3 class="text-2xl font-bold text-white mb-6">选择游戏模式</h3>

          <!-- AI vs Human -->
          <div
            class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 hover:border-amber-500 transition-all cursor-pointer group"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div
                  class="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center"
                >
                  <svg
                    class="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <h4
                    class="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors"
                  >
                    人机对战
                  </h4>
                  <p class="text-slate-400 text-sm">与AI对手切磋技艺</p>
                </div>
              </div>
              <svg
                class="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </div>
          </div>

          <!-- Local Multiplayer -->
          <div
            class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 hover:border-green-500 transition-all cursor-pointer group"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div
                  class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center"
                >
                  <svg
                    class="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <h4
                    class="text-lg font-semibold text-white group-hover:text-green-400 transition-colors"
                  >
                    本地对战
                  </h4>
                  <p class="text-slate-400 text-sm">与朋友面对面对弈</p>
                </div>
              </div>
              <svg
                class="w-5 h-5 text-slate-400 group-hover:text-green-400 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </div>
          </div>

          <!-- Online Matchmaking -->
          <div
            class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-all cursor-pointer group"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div
                  class="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center"
                >
                  <svg
                    class="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                    ></path>
                  </svg>
                </div>
                <div>
                  <h4
                    class="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors"
                  >
                    在线匹配
                  </h4>
                  <p class="text-slate-400 text-sm">与全球玩家竞技</p>
                </div>
              </div>
              <svg
                class="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </div>
          </div>

          <!-- Quick Play Button -->
          <RouterLink to="/play">
            <button
              class="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              快速开始游戏
            </button>
          </RouterLink>
        </div>
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
