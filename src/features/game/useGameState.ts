import { defineStore } from "pinia"
import { ref } from "vue"
import type { EntityPosition, SceneEntity } from "../entities/entity"

export const useGameState = defineStore("gameState", () => {
  const paused = ref(false)
  const tapDestination = ref<EntityPosition | null>(null)
  const nearbyEntity = ref<SceneEntity | null>(null)

  function setPaused(value: boolean) {
    paused.value = value
  }

  function setTapDestination({ x, y, z }: { x: number; y: number; z: number }) {
    tapDestination.value = { x, y, z }
  }

  function clearTapDestination() {
    tapDestination.value = null
  }

  return {
    paused,
    tapDestination,
    nearbyEntity,
    setPaused,
    setTapDestination,
    clearTapDestination,
  }
})
