import { defineStore } from "pinia"
import { markRaw, ref } from "vue"
import { PLAYER_HALF, NPC_COLLISION_RADIUS } from "./usePlayerMovement"
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
  /** Called when the player interacts with this entity. */
  onInteract?: () => void
  /** Reactive label shown in the HUD action button. */
  actionLabel?: () => string
}

const INTERACTION_DISTANCE = 1.8

export interface SceneCamera {
  fov: number
  near: number
  far: number
  offset: { x: number; y: number; z: number }
}

export const useSceneStore = defineStore("scene", () => {
  const entities = ref<Array<SceneEntity>>([])
  const nearbyEntity = ref<SceneEntity | null>(null)
  const tapDestination = ref<EntityPosition | null>(null)
  const paused = ref(false)
  const dialogEntity = ref<SceneEntity | null>(null)
  const dialogDescription = ref<string | null>(null)
  const camera = ref<SceneCamera | null>(null)

  function setCamera(config: SceneCamera) {
    camera.value = config
  }

  function setPaused(value: boolean) {
    paused.value = value
  }

  function openDialog({ description = "" }: { description?: string } = {}) {
    if (nearbyEntity.value === null) return
    dialogEntity.value = nearbyEntity.value
    dialogDescription.value = description
    paused.value = true
  }

  function closeDialog() {
    dialogEntity.value = null
    dialogDescription.value = null
    paused.value = false
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

  // March a ray from (fromX, fromZ) toward (toX, toZ) and return the last
  // position along the ray that does not overlap any solid entity.
  function resolveDestination(fromX: number, fromZ: number, toX: number, toZ: number): { x: number; z: number } {
    const dx = toX - fromX
    const dz = toZ - fromZ
    const totalDist = Math.sqrt(dx * dx + dz * dz)
    if (totalDist === 0) return { x: fromX, z: fromZ }

    const nx = dx / totalDist
    const nz = dz / totalDist
    const STEP = 0.1

    const solidEntities = getInteractables().filter((e) => e.collider === "solid")

    function isOverlapping(x: number, z: number): boolean {
      for (const entity of solidEntities) {
        if (entity.colliderSize !== undefined) {
          const { hw, hd } = entity.colliderSize
          if (Math.abs(x - entity.position.x) < PLAYER_HALF + hw && Math.abs(z - entity.position.z) < PLAYER_HALF + hd) {
            return true
          }
        } else {
          if (Math.sqrt((x - entity.position.x) ** 2 + (z - entity.position.z) ** 2) < NPC_COLLISION_RADIUS) {
            return true
          }
        }
      }
      return false
    }

    let lastX = fromX
    let lastZ = fromZ
    let traveled = 0

    while (traveled < totalDist) {
      traveled = Math.min(traveled + STEP, totalDist)
      const cx = fromX + nx * traveled
      const cz = fromZ + nz * traveled
      if (isOverlapping(cx, cz)) break
      lastX = cx
      lastZ = cz
    }

    return { x: lastX, z: lastZ }
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
    dialogEntity,
    dialogDescription,
    setPaused,
    openDialog,
    closeDialog,
    register,
    unregister,
    setTapDestination,
    clearTapDestination,
    getPlayer,
    getInteractables,
    resolveDestination,
    updateNearbyEntity,
    camera,
    setCamera,
  }
})
