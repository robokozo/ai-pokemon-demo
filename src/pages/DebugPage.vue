<script setup lang="ts">
import { ref } from "vue"
import { RouterLink } from "vue-router"
import VoiceDebug from "../features/ui/VoiceDebug.vue"
import PromptDebug from "../features/ui/PromptDebug.vue"

type DebugTab = "voice" | "prompt"
const activeTab = ref<DebugTab>("voice")
</script>

<template>
  <div class="page-wrap">
    <nav class="page-nav">
      <RouterLink to="/">⚙ Setup</RouterLink>
      <RouterLink to="/game">▶ Game</RouterLink>
      <span class="page-nav-current">🛠 Debug</span>
    </nav>

    <div class="tab-bar">
      <button :class="['tab-btn', activeTab === 'voice' ? 'tab-btn--active' : '']" @click="() => (activeTab = 'voice')">🎤 Voice</button>
      <button :class="['tab-btn', activeTab === 'prompt' ? 'tab-btn--active' : '']" @click="() => (activeTab = 'prompt')">🤖 Prompt</button>
    </div>

    <VoiceDebug v-if="activeTab === 'voice'" />
    <PromptDebug v-else-if="activeTab === 'prompt'" />
  </div>
</template>

<style scoped>
.page-wrap {
  min-height: 100vh;
  background: #0f0f1a;
  padding: 24px;
  box-sizing: border-box;
  max-width: 720px;
  margin: 0 auto;
}

.page-nav {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #333;
  align-items: center;
}

.page-nav a {
  color: #ffd700;
  text-decoration: none;
  font-size: 0.85rem;
  padding: 4px 10px;
  border: 1px solid #ffd700;
  border-radius: 4px;
}

.page-nav a:hover {
  background: #ffd700;
  color: #1a1a2e;
}

.page-nav-current {
  font-size: 0.85rem;
  color: #aaa;
  margin-left: auto;
}

.tab-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  border-bottom: 1px solid #333;
  padding-bottom: 0;
}

.tab-btn {
  padding: 8px 18px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #aaa;
  font-family: monospace;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: -1px;
}

.tab-btn:hover {
  color: #e8e8e8;
}

.tab-btn--active {
  color: #ffd700;
  border-bottom-color: #ffd700;
}
</style>
