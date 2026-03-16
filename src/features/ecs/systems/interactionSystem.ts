import { query } from "bitecs"
import type { EcsWorld } from "../world"
import { usePhysicsStore } from "../../physics/usePhysicsStore"
import { useGameState } from "../../game/useGameState"

/**
 * Queries Rapier sensor overlaps with the player's collider to find
 * the nearest interactive entity. Updates gameState.nearbyEntity.
 */
export function interactionSystem({ world }: { world: EcsWorld }) {
  const physicsStore = usePhysicsStore()
  const gameState = useGameState()
  const physWorld = physicsStore.world
  if (physWorld === null) return

  const { Position, PlayerTag, InteractiveTag } = world.components
  const players = query(world, [PlayerTag, Position])

  if (players.length === 0) {
    gameState.nearbyEntity = null
    return
  }

  const playerEid = players[0]
  const playerCollider = physicsStore.getCollider({ eid: playerEid })
  if (playerCollider === null) {
    gameState.nearbyEntity = null
    return
  }

  let nearestEid: number | null = null
  let nearestDist = Infinity

  const px = Position.x[playerEid]
  const pz = Position.z[playerEid]

  // Check all interactive entities that have sensors for overlap with the player.
  const interactiveEntities = query(world, [InteractiveTag, Position])

  for (const eid of interactiveEntities) {
    const sensor = physicsStore.getSensor({ eid })
    if (sensor === null) continue

    // Check if player collider intersects with this sensor.
    const isOverlapping = physWorld.intersectionPair(playerCollider, sensor)
    if (isOverlapping !== true) continue

    const dx = px - Position.x[eid]
    const dz = pz - Position.z[eid]
    const dist = Math.sqrt(dx * dx + dz * dz)

    if (dist < nearestDist) {
      nearestDist = dist
      nearestEid = eid
    }
  }

  gameState.nearbyEntity = nearestEid
}
