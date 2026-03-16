import { defineStore } from "pinia"
import { ref } from "vue"

export interface TapDestination {
  x: number
  y: number
  z: number
}

export const useGameState = defineStore("gameState", () => {
  const paused = ref(false)
  const tapDestination = ref<TapDestination | null>(null)
  // Stores a bitECS entity ID instead of a SceneEntity reference.
  const nearbyEntity = ref<number | null>(null)

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
