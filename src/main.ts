import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useUserStore } from '@/stores/user'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 初始化用户认证状态
const userStore = useUserStore()
userStore.initializeAuth()

app.mount('#app')
