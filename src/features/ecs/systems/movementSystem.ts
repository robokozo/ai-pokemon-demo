import { query } from "bitecs"
import type { EcsWorld } from "../world"
import { useGameState } from "../../game/useGameState"

const MOVE_SPEED = 0.05
const ARRIVE_THRESHOLD = 0.12
const STUCK_LIMIT = 10

let stuckFrameCount = 0
let lastDistToDestination = Infinity

/** Resets internal state (call on scene change). */
export function resetMovementState() {
  stuckFrameCount = 0
  lastDistToDestination = Infinity
}

/**
 * Reads keyboard + tap input, writes desired velocity into the player's Velocity component.
 * Does NOT apply position — that happens in physicsSystem after Rapier steps.
 */
export function movementSystem({ world, keys }: { world: EcsWorld; keys: Record<string, boolean> }) {
  const gameState = useGameState()
  if (gameState.paused === true) return

  const { Position, Velocity, PlayerTag } = world.components
  const players = query(world, [PlayerTag, Position, Velocity])

  for (const eid of players) {
    let dx = 0
    let dz = 0

    const hasKeyW = keys["w"] === true || keys["W"] === true
    const hasKeyS = keys["s"] === true || keys["S"] === true
    const hasKeyA = keys["a"] === true || keys["A"] === true
    const hasKeyD = keys["d"] === true || keys["D"] === true
    const hasKeyUp = keys["ArrowUp"] === true
    const hasKeyDown = keys["ArrowDown"] === true
    const hasKeyLeft = keys["ArrowLeft"] === true
    const hasKeyRight = keys["ArrowRight"] === true

    const hasKeyInput = hasKeyW || hasKeyS || hasKeyA || hasKeyD || hasKeyUp || hasKeyDown || hasKeyLeft || hasKeyRight

    if (hasKeyInput === true) {
      gameState.clearTapDestination()
      if (hasKeyW || hasKeyUp) dz -= MOVE_SPEED
      if (hasKeyS || hasKeyDown) dz += MOVE_SPEED
      if (hasKeyA || hasKeyLeft) dx -= MOVE_SPEED
      if (hasKeyD || hasKeyRight) dx += MOVE_SPEED
    } else if (gameState.tapDestination !== null) {
      const dest = gameState.tapDestination
      const ddx = dest.x - Position.x[eid]
      const ddz = dest.z - Position.z[eid]
      const dist = Math.sqrt(ddx * ddx + ddz * ddz)

      if (dist < ARRIVE_THRESHOLD) {
        gameState.clearTapDestination()
        lastDistToDestination = Infinity
      } else {
        dx = (ddx / dist) * MOVE_SPEED
        dz = (ddz / dist) * MOVE_SPEED

        if (dist < lastDistToDestination - 0.001) {
          stuckFrameCount = 0
        } else {
          stuckFrameCount++
          if (stuckFrameCount >= STUCK_LIMIT) {
            gameState.clearTapDestination()
            lastDistToDestination = Infinity
          }
        }
        lastDistToDestination = dist
      }
    }

    Velocity.x[eid] = dx
    Velocity.z[eid] = dz
  }
}
