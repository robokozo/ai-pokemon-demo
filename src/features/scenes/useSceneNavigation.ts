import { defineStore } from "pinia"
import { ref } from "vue"
import { useGameState } from "../game/useGameState"
import { useDialogStore } from "../dialog/useDialogStore"

export type SceneName = "bedroom" | "first-floor" | "home-exterior"
export type Entrypoint = string

export interface SceneCamera {
  fov: number
  near: number
  far: number
  offset: { x: number; y: number; z: number }
}

export const useSceneNavigation = defineStore("sceneNavigation", () => {
  const gameState = useGameState()
  const dialog = useDialogStore()

  const currentScene = ref<SceneName>("bedroom")
  const activeEntrypoint = ref<Entrypoint>("default")
  const camera = ref<SceneCamera | null>(null)
  const isTransitioning = ref(false)

  function setScene({ scene, entrypoint = "default" }: { scene: SceneName; entrypoint?: Entrypoint }) {
    currentScene.value = scene
    activeEntrypoint.value = entrypoint
    gameState.clearTapDestination()
    gameState.nearbyEntity = null
    dialog.closeDialog()
  }

  function setCamera(config: SceneCamera) {
    camera.value = config
  }

  return {
    currentScene,
    activeEntrypoint,
    camera,
    isTransitioning,
    setScene,
    setCamera,
  }
})
