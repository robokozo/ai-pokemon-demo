<script setup lang="ts">
import { ref, watch } from "vue"
import { useTimeoutFn } from "@vueuse/core"
import { useSceneNavigation } from "../scenes/useSceneNavigation"

import type { SceneName, Entrypoint } from "../scenes/useSceneNavigation"

const FADE_DURATION_MS = 300

const sceneNav = useSceneNavigation()

const isFadedOut = ref(false)
const visibleScene = ref(sceneNav.currentScene)

const pendingScene = ref<SceneName | null>(null)
const pendingEntrypoint = ref<Entrypoint>("default")

const originalSetScene = sceneNav.setScene.bind(sceneNav)

// Override setScene to go through the fade transition
sceneNav.setScene = function setSceneWithTransition({ scene, entrypoint = "default" }: { scene: SceneName; entrypoint?: Entrypoint }) {
  if (sceneNav.isTransitioning === true) return
  sceneNav.isTransitioning = true
  pendingScene.value = scene
  pendingEntrypoint.value = entrypoint
  isFadedOut.value = true
}

watch(isFadedOut, (isFaded) => {
  if (isFaded !== true || pendingScene.value === null) return

  // Swap the scene once the fade-out has finished.
  useTimeoutFn(() => {
    originalSetScene({ scene: pendingScene.value!, entrypoint: pendingEntrypoint.value })
    visibleScene.value = pendingScene.value!
    pendingScene.value = null
    isFadedOut.value = false
  }, FADE_DURATION_MS)

  // End the transition flag after both fade-out + fade-in have finished.
  useTimeoutFn(() => {
    sceneNav.isTransitioning = false
  }, FADE_DURATION_MS * 2)
})
</script>

<template>
  <div class="scene-transition">
    <div class="scene-transition__content" :class="{ 'scene-transition__content--faded': isFadedOut === true }">
      <slot :visible-scene="visibleScene" />
    </div>
    <div class="scene-transition__overlay" :class="{ 'scene-transition__overlay--active': isFadedOut === true }" />
  </div>
</template>

<style scoped>
.scene-transition {
  position: relative;
  width: 100%;
  height: 100%;
}

.scene-transition__content {
  width: 100%;
  height: 100%;
  transition: opacity 300ms ease-in-out;
}

.scene-transition__content--faded {
  opacity: 0;
}

.scene-transition__overlay {
  position: absolute;
  inset: 0;
  background: #000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 300ms ease-in-out;
}

.scene-transition__overlay--active {
  opacity: 1;
}
</style>
