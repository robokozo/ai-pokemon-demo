import type { EntityId } from "bitecs"
import { useEcsStore } from "./useEcsStore"

/**
 * Returns a function that reads the current position from bitECS arrays.
 * Intended for use inside onBeforeRender to set Three.js group positions
 * directly, bypassing Vue reactivity for per-frame performance.
 */
export function useEcsPosition({ eid }: { eid: EntityId }) {
  const ecsStore = useEcsStore()

  function getPosition(): { x: number; y: number; z: number } {
    const { Position } = ecsStore.world.components
    return {
      x: Position.x[eid],
      y: Position.y[eid],
      z: Position.z[eid],
    }
  }

  return { getPosition }
}
