import { reactive } from "vue"

// Tracks which keys are currently held. Consumed by usePlayerMovement.
export function useControls() {
  const keys = reactive<Record<string, boolean>>({})

  function onKeyDown({ key }: KeyboardEvent) {
    keys[key] = true
  }

  function onKeyUp({ key }: KeyboardEvent) {
    keys[key] = false
  }

  return { keys, onKeyDown, onKeyUp }
}
