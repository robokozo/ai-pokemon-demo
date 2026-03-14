<script setup lang="ts">
import { ref } from 'vue'
import SetupScreen from './components/SetupScreen.vue'
import GameScene from './components/GameScene.vue'

const gameStarted = ref(false)

function startGame() {
  gameStarted.value = true
}
</script>

<template>
  <SetupScreen v-if="!gameStarted" @start="startGame" />
  <GameScene v-else />
</template>
