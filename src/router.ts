import { createRouter, createWebHashHistory } from "vue-router"
import SetupPage from "./pages/SetupPage.vue"
import GamePage from "./pages/GamePage.vue"
import DebugPage from "./pages/DebugPage.vue"

const router = createRouter({
  // Hash history works on GitHub Pages without any server config
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "setup", component: SetupPage },
    { path: "/game", name: "game", component: GamePage },
    { path: "/debug", name: "debug", component: DebugPage },
  ],
})

export default router
