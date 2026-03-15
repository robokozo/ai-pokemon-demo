import { defineStore } from "pinia"
import { ref } from "vue"

export type EntityKind = "player" | "npc" | "prop"

export interface EntityPosition {
  x: number
  y: number
  z: number
}

export interface SceneEntity {
  id: string
  name: string
  kind: EntityKind
  position: EntityPosition
}

const INTERACTION_DISTANCE = 1.8

export const useSceneStore = defineStore("scene", () => {
  const entities = ref<Array<SceneEntity>>([])
  const nearbyEntity = ref<SceneEntity | null>(null)
  const tapDestination = ref<EntityPosition | null>(null)

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

  function getNPCs(): Array<SceneEntity> {
    return entities.value.filter((e) => e.kind !== "player")
  }

  function updateNearbyEntity() {
    const player = getPlayer()
    if (player === null) {
      nearbyEntity.value = null
      return
    }
    nearbyEntity.value = null
    for (const npc of getNPCs()) {
      const dx = player.position.x - npc.position.x
      const dz = player.position.z - npc.position.z
      const dist = Math.sqrt(dx * dx + dz * dz)
      if (dist <= INTERACTION_DISTANCE) {
        nearbyEntity.value = npc
        break
      }
    }
  }

  return {
    entities,
    nearbyEntity,
    tapDestination,
    register,
    unregister,
    setTapDestination,
    clearTapDestination,
    getPlayer,
    getNPCs,
    updateNearbyEntity,
  }
})
