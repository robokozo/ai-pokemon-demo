import { query, hasComponent } from "bitecs"
import type { EcsWorld } from "../world"
import { usePhysicsStore } from "../../physics/usePhysicsStore"
import { useEcsStore } from "../useEcsStore"
import { useGameState } from "../../game/useGameState"

/**
 * Applies velocity to kinematic bodies, steps the Rapier world,
 * then reads back resolved positions into bitECS Position arrays.
 */
export function physicsSystem({ world }: { world: EcsWorld }) {
  const physicsStore = usePhysicsStore()
  const ecsStore = useEcsStore()
  const gameState = useGameState()
  const physWorld = physicsStore.world
  if (physWorld === null) return
  if (gameState.paused === true) return

  const { Position, Velocity, RigidBodyRef, PlayerTag } = world.components
  const dynamicEntities = query(world, [RigidBodyRef, Position, Velocity])

  // Apply kinematic target for player entities.
  for (const eid of dynamicEntities) {
    const body = physicsStore.getBody({ eid })
    if (body === null) continue

    if (hasComponent(world, eid, PlayerTag) === true) {
      const targetX = Position.x[eid] + Velocity.x[eid]
      const targetZ = Position.z[eid] + Velocity.z[eid]
      body.setNextKinematicTranslation({ x: targetX, y: 0, z: targetZ })
    }
  }

  // Step physics.
  physWorld.step()

  // Read back resolved positions from Rapier.
  for (const eid of dynamicEntities) {
    const body = physicsStore.getBody({ eid })
    if (body === null) continue

    const translation = body.translation()
    const prevX = Position.x[eid]
    const prevZ = Position.z[eid]
    Position.x[eid] = translation.x
    Position.z[eid] = translation.z

    // If tap-to-move is active and both axes were completely blocked, cancel destination.
    if (hasComponent(world, eid, PlayerTag) === true) {
      // Sync reactive player position for camera tracking etc.
      ecsStore.updatePlayerPosition({ x: translation.x, y: 0, z: translation.z })

      if (gameState.tapDestination !== null) {
        const isMovingIntent = Velocity.x[eid] !== 0 || Velocity.z[eid] !== 0
        const isFullyBlocked = Math.abs(translation.x - prevX) < 0.001 && Math.abs(translation.z - prevZ) < 0.001
        if (isMovingIntent === true && isFullyBlocked === true) {
          gameState.clearTapDestination()
        }
      }
    }
  }
}
