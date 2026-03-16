import { ref, type Ref } from "vue"
import { useRafFn } from "@vueuse/core"
import { useEcsStore } from "./useEcsStore"
import { timeSystem } from "./systems/timeSystem"
import { movementSystem } from "./systems/movementSystem"
import { physicsSystem } from "./systems/physicsSystem"
import { interactionSystem } from "./systems/interactionSystem"
import { facingSystem } from "./systems/facingSystem"

/**
 * Registers all ECS systems into a RAF loop via VueUse.
 * Self-cleans on component unmount — no TresCanvas context required.
 */
export function useGameLoop({ keys }: { keys: Record<string, boolean> }): { facing: Ref<number> } {
  const ecsStore = useEcsStore()
  const facing = ref(0)

  useRafFn(() => {
    const world = ecsStore.world

    timeSystem({ world })
    movementSystem({ world, keys })
    physicsSystem({ world })
    interactionSystem({ world })
    facingSystem({ world, facing })
  })

  return { facing }
}
