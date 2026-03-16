import { onUnmounted } from "vue"
import { addComponent } from "bitecs"
import type { EntityId } from "bitecs"
import { useEcsStore } from "./useEcsStore"
import { usePhysicsStore } from "../physics/usePhysicsStore"

// Half-height for all cuboid colliders in the Y axis (top-down game, thin slabs).
const COLLIDER_HALF_HEIGHT = 0.5

/**
 * Attaches a kinematic Rapier rigid body, cuboid collider, character controller,
 * and Velocity component to an existing entity.
 * Reads the spawn position directly from the entity's ECS Position component.
 */
export function useKinematicBody({ eid, hw, hd }: { eid: EntityId; hw: number; hd: number }): void {
  const ecsStore = useEcsStore()
  const physicsStore = usePhysicsStore()

  if (physicsStore.world === null || physicsStore.rapier === null) {
    throw new Error(`[useKinematicBody] Physics world not initialized for entity ${eid}.`)
  }

  const RAPIER = physicsStore.rapier
  const physWorld = physicsStore.world
  const w = ecsStore.world

  const { Position, BoxCollider, RigidBodyRef, ColliderRef, Velocity } = w.components

  addComponent(w, eid, BoxCollider)
  BoxCollider.hw[eid] = hw
  BoxCollider.hd[eid] = hd

  addComponent(w, eid, Velocity)
  Velocity.x[eid] = 0
  Velocity.z[eid] = 0

  const bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(Position.x[eid], Position.y[eid], Position.z[eid])
  const body = physWorld.createRigidBody(bodyDesc)
  physicsStore.addBody({ eid, body })

  addComponent(w, eid, RigidBodyRef)
  RigidBodyRef.index[eid] = eid

  const colliderDesc = RAPIER.ColliderDesc.cuboid(hw, COLLIDER_HALF_HEIGHT, hd)
  const col = physWorld.createCollider(colliderDesc, body)
  physicsStore.addCollider({ eid, collider: col })

  addComponent(w, eid, ColliderRef)
  ColliderRef.index[eid] = eid

  const controller = physWorld.createCharacterController(0.01)
  physicsStore.setCharacterController({ controller })

  onUnmounted(() => {
    physicsStore.removeCollider({ eid })
    physicsStore.removeBody({ eid })
  })
}
