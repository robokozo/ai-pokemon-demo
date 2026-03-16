import { defineStore } from "pinia"
import { ref } from "vue"
import { useGameState } from "../game/useGameState"

export const useDialogStore = defineStore("dialog", () => {
  const gameState = useGameState()

  const dialogEntityId = ref<number | null>(null)
  const dialogEntityName = ref<string | null>(null)
  const dialogEntityKind = ref<string | null>(null)
  const dialogDescription = ref<string | null>(null)

  function openDialog({ eid, name, kind, description = "" }: { eid: number; name: string; kind: string; description?: string }) {
    dialogEntityId.value = eid
    dialogEntityName.value = name
    dialogEntityKind.value = kind
    dialogDescription.value = description
    gameState.setPaused(true)
  }

  function closeDialog() {
    dialogEntityId.value = null
    dialogEntityName.value = null
    dialogEntityKind.value = null
    dialogDescription.value = null
    gameState.setPaused(false)
  }

  return {
    dialogEntityId,
    dialogEntityName,
    dialogEntityKind,
    dialogDescription,
    openDialog,
    closeDialog,
  }
})
