import { defineStore } from "pinia"
import { ref } from "vue"

export type EntityKind = "player" | "npc" | "prop"
export type ColliderType = "solid" | "none"

export interface EntityPosition {
  x: number
  y: number
  z: number
}

export interface SceneEntity {
  id: string
  name: string
  kind: EntityKind
  collider: ColliderType
  /** AABB half-extents (X, Z) for box collision. Falls back to circle when absent. */
  colliderSize?: { hw: number; hd: number }
  /** Only entities with interactive: true set nearbyEntity and show HUD actions. */
  interactive?: true
  position: EntityPosition
}

const INTERACTION_DISTANCE = 1.8

export const useSceneStore = defineStore("scene", () => {
  const entities = ref<Array<SceneEntity>>([])
  const nearbyEntity = ref<SceneEntity | null>(null)
  const tapDestination = ref<EntityPosition | null>(null)
  const paused = ref(false)

  function setPaused(value: boolean) {
    paused.value = value
  }

  function register(entity: SceneEntity) {
    entities.value.push(entity)
  }

  function unregister({ id }: { id: string }) {
    entities.value = entities.value.filter((e) => e.id !== id)
    if (nearbyEntity.value?.id === id) {
      nearbyEntity.value = null
    }
  }

  function setTapDestination({ x, y, z }: { x: number; y: number; z: number }) {
    tapDestination.value = { x, y, z }
  }

  function clearTapDestination() {
    tapDestination.value = null
  }

  function getPlayer(): SceneEntity | null {
    return entities.value.find((e) => e.kind === "player") ?? null
  }

  function getInteractables(): Array<SceneEntity> {
    return entities.value.filter((e) => e.kind !== "player")
  }

  function updateNearbyEntity() {
    const player = getPlayer()
    if (player === null) {
      nearbyEntity.value = null
      return
    }
    nearbyEntity.value = null
    for (const entity of getInteractables()) {
      if (entity.interactive !== true) continue
      const dx = player.position.x - entity.position.x
      const dz = player.position.z - entity.position.z
      const dist = Math.sqrt(dx * dx + dz * dz)
      if (dist <= INTERACTION_DISTANCE) {
        nearbyEntity.value = entity
        break
      }
    }
  }

  return {
    entities,
    nearbyEntity,
    tapDestination,
    paused,
    setPaused,
    register,
    unregister,
    setTapDestination,
    clearTapDestination,
    getPlayer,
    getInteractables,
    updateNearbyEntity,
  }
})
