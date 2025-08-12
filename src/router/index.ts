import { createRouter, createWebHistory } from 'vue-router'
import IndexView from '@/views/IndexView.vue'
import GameView from '@/views/GameView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import WebSocketTestView from '@/views/WebSocketTestView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: IndexView,
    },
    {
      path: '/game',
      name: 'game',
      component: GameView,
    },
    {
      path: '/game/:room_id',
      name: 'game-in-room',
      component: GameView,
      props: true, // Enable passing route params as props to the component
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/ws-test',
      name: 'websocket-test',
      component: WebSocketTestView,
    },
  ],
})

export default router
