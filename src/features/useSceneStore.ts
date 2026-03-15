import { defineStore } from "pinia"
import { markRaw, ref } from "vue"

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
  /** Marks entities that never move. register() calls markRaw() on them to skip Vue's deep proxy. */
  isStatic?: true
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
    if (entity.isStatic === true) {
      markRaw(entity)
    }
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

  // Nudge a tap destination that lands inside a solid collider to the nearest
  // point just outside it. Returns the adjusted position.
  function clampTapDestination({ x, z }: { x: number; z: number }): { x: number; z: number } {
    const PLAYER_HALF = 0.3
    let cx = x
    let cz = z
    for (const entity of entities.value.filter((e) => e.collider === "solid")) {
      if (entity.colliderSize !== undefined) {
        const { hw, hd } = entity.colliderSize
        const ox = cx - entity.position.x
        const oz = cz - entity.position.z
        const overlapX = PLAYER_HALF + hw - Math.abs(ox)
        const overlapZ = PLAYER_HALF + hd - Math.abs(oz)
        if (overlapX > 0 && overlapZ > 0) {
          // Push out along the axis of least penetration
          if (overlapX < overlapZ) {
            cx += overlapX * Math.sign(ox)
          } else {
            cz += overlapZ * Math.sign(oz)
          }
        }
      }
    }
    return { x: cx, z: cz }
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
    clampTapDestination,
    updateNearbyEntity,
  }
})
