import { defineStore } from "pinia"
import { shallowRef, shallowReactive } from "vue"
import { buildWorld, type EcsWorld, type EntityKind } from "./world"

export interface EntityMetadata {
  name: string
  kind: EntityKind
  onInteract: (() => void) | null
  actionLabel: (() => string) | null
}

export const useEcsStore = defineStore("ecs", () => {
  const world = shallowRef<EcsWorld>(buildWorld())

  // Non-numeric entity data that bitECS cannot store in typed arrays.
  const metadata = new Map<number, EntityMetadata>()

  function setMetadata({ eid, data }: { eid: number; data: EntityMetadata }) {
    metadata.set(eid, data)
  }

  function getMetadata({ eid }: { eid: number }): EntityMetadata | null {
    return metadata.get(eid) ?? null
  }

  function removeMetadata({ eid }: { eid: number }) {
    metadata.delete(eid)
  }

  // Reactive player position — updated each frame by physicsSystem so Vue
  // computed properties (camera, etc.) react to player movement.
  const playerPosition = shallowReactive({ x: 0, y: 0, z: 0 })

  function updatePlayerPosition({ x, y, z }: { x: number; y: number; z: number }) {
    playerPosition.x = x
    playerPosition.y = y
    playerPosition.z = z
  }

  /** Reset the entire ECS world (e.g. on full scene teardown). */
  function resetWorld() {
    metadata.clear()
    world.value = buildWorld()
    playerPosition.x = 0
    playerPosition.y = 0
    playerPosition.z = 0
  }

  return {
    world,
    metadata,
    playerPosition,
    setMetadata,
    getMetadata,
    removeMetadata,
    updatePlayerPosition,
    resetWorld,
  }
})
