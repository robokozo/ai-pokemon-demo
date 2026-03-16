import { ref, type Ref } from "vue"
import { useLoop } from "@tresjs/core"
import { useEcsStore } from "./useEcsStore"
import { timeSystem } from "./systems/timeSystem"
import { movementSystem } from "./systems/movementSystem"
import { physicsSystem } from "./systems/physicsSystem"
import { interactionSystem } from "./systems/interactionSystem"
import { facingSystem } from "./systems/facingSystem"

/**
 * Registers all ECS systems into the TresJS render loop.
 * Must be called inside a TresCanvas context (so useLoop is available).
 */
export function useGameLoop({ keys }: { keys: Record<string, boolean> }): { facing: Ref<number> } {
  const ecsStore = useEcsStore()
  const facing = ref(0)

  const { onBeforeRender } = useLoop()

  onBeforeRender(() => {
    const world = ecsStore.world

    timeSystem({ world })
    movementSystem({ world, keys })
    physicsSystem({ world })
    interactionSystem({ world })
    facingSystem({ world, facing })
  })

  return { facing }
}
