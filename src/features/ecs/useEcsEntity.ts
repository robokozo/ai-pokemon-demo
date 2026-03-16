import { onUnmounted } from "vue"
import { addEntity, removeEntity, addComponent } from "bitecs"
import type { EntityId } from "bitecs"
import { useEcsStore, type EntityMetadata } from "./useEcsStore"
import type { EntityKind } from "./world"

interface EcsEntityConfig {
  name?: string
  kind: EntityKind
  position: [number, number, number]
  onInteract?: () => void
  actionLabel?: () => string
}

/**
 * Creates a bare ECS entity with a Position component and kind tag.
 * Attach physics and interaction capabilities via useStaticBody,
 * useKinematicBody, and useInteractionSensor.
 */
export function useEcsEntity({ name: nameProp, kind, position, onInteract, actionLabel }: EcsEntityConfig): { eid: EntityId } {
  const ecsStore = useEcsStore()
  const w = ecsStore.world

  const eid = addEntity(w)

  const { Position } = w.components
  addComponent(w, eid, Position)
  Position.x[eid] = position[0]
  Position.y[eid] = position[1]
  Position.z[eid] = position[2]

  const kindTagMap: Partial<Record<EntityKind, unknown>> = {
    player: w.components.PlayerTag,
    npc: w.components.NpcTag,
  }
  const kindTag = kindTagMap[kind]
  if (kindTag !== undefined) {
    addComponent(w, eid, kindTag)
  }

  const meta: EntityMetadata = {
    name: nameProp ?? `entity-${eid}`,
    kind,
    onInteract: onInteract ?? null,
    actionLabel: actionLabel ?? null,
  }
  ecsStore.setMetadata({ eid, data: meta })

  onUnmounted(() => {
    ecsStore.removeMetadata({ eid })
    removeEntity(w, eid)
  })

  return { eid }
}
