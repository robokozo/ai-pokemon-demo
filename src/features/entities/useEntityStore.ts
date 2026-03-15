import { defineStore } from "pinia"
import { markRaw, ref } from "vue"
import type { EntityPosition, SceneEntity } from "./entity"

const INTERACTION_DISTANCE = 1.8

export const useEntityStore = defineStore("entities", () => {
  const entities = ref<Array<SceneEntity>>([])

  function register(entity: SceneEntity) {
    if (entity.isStatic === true) {
      markRaw(entity)
    }
    entities.value.push(entity)
  }

  function unregister({ id }: { id: string }) {
    entities.value = entities.value.filter((e) => e.id !== id)
  }

  function getPlayer(): SceneEntity | null {
    return entities.value.find((e) => e.kind === "player") ?? null
  }

  function getNonPlayerEntities(): Array<SceneEntity> {
    return entities.value.filter((e) => e.kind !== "player")
  }

  function getSolidEntities(): Array<SceneEntity> {
    return entities.value.filter((e) => e.kind !== "player" && e.collider === "solid")
  }

  function findNearestInteractive({
    position,
    maxDistance = INTERACTION_DISTANCE,
  }: {
    position: EntityPosition
    maxDistance?: number
  }): SceneEntity | null {
    let nearest: SceneEntity | null = null
    let nearestDist = maxDistance

    for (const entity of entities.value) {
      if (entity.interactive !== true) continue
      const dx = position.x - entity.position.x
      const dz = position.z - entity.position.z
      const dist = Math.sqrt(dx * dx + dz * dz)
      if (dist <= nearestDist) {
        nearest = entity
        nearestDist = dist
      }
    }

    return nearest
  }

  return {
    entities,
    register,
    unregister,
    getPlayer,
    getNonPlayerEntities,
    getSolidEntities,
    findNearestInteractive,
  }
})
