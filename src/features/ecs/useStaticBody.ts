import { onUnmounted } from "vue"
import { addComponent } from "bitecs"
import type { EntityId } from "bitecs"
import type RAPIER from "@dimforge/rapier3d-compat"
import { useEcsStore } from "./useEcsStore"
import { usePhysicsStore } from "../physics/usePhysicsStore"

// Half-height for all cuboid colliders in the Y axis (top-down game, thin slabs).
const COLLIDER_HALF_HEIGHT = 0.5

/**
 * Attaches a fixed Rapier rigid body and cuboid collider to an existing entity.
 * Reads the spawn position directly from the entity's ECS Position component.
 * Returns the Rapier body so an interaction sensor can be attached to it.
 */
export function useStaticBody({ eid, hw, hd }: { eid: EntityId; hw: number; hd: number }): { body: RAPIER.RigidBody } {
  const ecsStore = useEcsStore()
  const physicsStore = usePhysicsStore()

  if (physicsStore.world === null || physicsStore.rapier === null) {
    throw new Error(`[useStaticBody] Physics world not initialized for entity ${eid}.`)
  }

  const RAPIER = physicsStore.rapier
  const physWorld = physicsStore.world
  const w = ecsStore.world

  const { Position, BoxCollider, RigidBodyRef, ColliderRef, StaticTag } = w.components

  addComponent(w, eid, BoxCollider)
  BoxCollider.hw[eid] = hw
  BoxCollider.hd[eid] = hd

  addComponent(w, eid, StaticTag)

  const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(Position.x[eid], Position.y[eid], Position.z[eid])
  const body = physWorld.createRigidBody(bodyDesc)
  physicsStore.addBody({ eid, body })

  addComponent(w, eid, RigidBodyRef)
  RigidBodyRef.index[eid] = eid

  const colliderDesc = RAPIER.ColliderDesc.cuboid(hw, COLLIDER_HALF_HEIGHT, hd)
  const col = physWorld.createCollider(colliderDesc, body)
  physicsStore.addCollider({ eid, collider: col })

  addComponent(w, eid, ColliderRef)
  ColliderRef.index[eid] = eid

  onUnmounted(() => {
    physicsStore.removeCollider({ eid })
    physicsStore.removeBody({ eid })
  })

  return { body }
}
