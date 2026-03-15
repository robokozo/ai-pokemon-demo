import { defineStore } from "pinia"
import { ref } from "vue"
import type { SceneEntity } from "../entities/entity"
import { useGameState } from "../game/useGameState"

export const useDialogStore = defineStore("dialog", () => {
  const gameState = useGameState()

  const dialogEntity = ref<SceneEntity | null>(null)
  const dialogDescription = ref<string | null>(null)

  function openDialog({ entity, description = "" }: { entity: SceneEntity; description?: string }) {
    dialogEntity.value = entity
    dialogDescription.value = description
    gameState.setPaused(true)
  }

  function closeDialog() {
    dialogEntity.value = null
    dialogDescription.value = null
    gameState.setPaused(false)
  }

  return {
    dialogEntity,
    dialogDescription,
    openDialog,
    closeDialog,
  }
})
