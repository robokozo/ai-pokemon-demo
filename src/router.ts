import { createRouter, createWebHashHistory } from 'vue-router'
import SetupScreen from './components/SetupScreen.vue'
import GameScene from './components/GameScene.vue'
import VoiceDebug from './components/VoiceDebug.vue'

const router = createRouter({
  // Hash history works on GitHub Pages without any server config
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',      name: 'setup', component: SetupScreen },
    { path: '/game',  name: 'game',  component: GameScene },
    { path: '/debug', name: 'debug', component: VoiceDebug },
  ],
})

export default router
