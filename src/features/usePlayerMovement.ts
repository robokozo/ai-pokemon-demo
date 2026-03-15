import { useSceneStore } from "./useSceneStore"
import type { EntityPosition } from "./useSceneStore"
import { useControls } from "./useControls"

const MOVE_SPEED = 0.05
const NPC_COLLISION_RADIUS = 0.7
const PLAYER_HALF = 0.3
const ARRIVE_THRESHOLD = 0.12
const STUCK_LIMIT = 10 // frames without progress toward destination before cancelling

export function usePlayerMovement({ controls, position }: { controls: ReturnType<typeof useControls>; position: EntityPosition }) {
  const store = useSceneStore()
  const { keys } = controls

  let stuckFrameCount = 0
  let lastDistToDestination = Infinity

  function tick() {
    if (store.paused === true) return

    const pos = position
    let dx = 0
    let dz = 0

    const hasKeyInput =
      keys["ArrowUp"] === true ||
      keys["w"] === true ||
      keys["W"] === true ||
      keys["ArrowDown"] === true ||
      keys["s"] === true ||
      keys["S"] === true ||
      keys["ArrowLeft"] === true ||
      keys["a"] === true ||
      keys["A"] === true ||
      keys["ArrowRight"] === true ||
      keys["d"] === true ||
      keys["D"] === true

    if (hasKeyInput === true) {
      store.clearTapDestination()
      if (keys["ArrowUp"] === true || keys["w"] === true || keys["W"] === true) dz -= MOVE_SPEED
      if (keys["ArrowDown"] === true || keys["s"] === true || keys["S"] === true) dz += MOVE_SPEED
      if (keys["ArrowLeft"] === true || keys["a"] === true || keys["A"] === true) dx -= MOVE_SPEED
      if (keys["ArrowRight"] === true || keys["d"] === true || keys["D"] === true) dx += MOVE_SPEED
    } else if (store.tapDestination !== null) {
      const dest = store.tapDestination
      const ddx = dest.x - pos.x
      const ddz = dest.z - pos.z
      const dist = Math.sqrt(ddx * ddx + ddz * ddz)

      if (dist < ARRIVE_THRESHOLD) {
        store.clearTapDestination()
        lastDistToDestination = Infinity
      } else {
        dx = (ddx / dist) * MOVE_SPEED
        dz = (ddz / dist) * MOVE_SPEED

        // Cancel if we're not getting meaningfully closer to the destination
        if (dist < lastDistToDestination - 0.001) {
          stuckFrameCount = 0
        } else {
          stuckFrameCount++
          if (stuckFrameCount >= STUCK_LIMIT) {
            store.clearTapDestination()
            lastDistToDestination = Infinity
          }
        }
        lastDistToDestination = dist
      }
    }

    const solidEntities = store.getInteractables().filter((e) => e.collider === "solid")

    // Test whether a given (x, z) position overlaps any solid entity.
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

    // Resolve each axis independently so the player slides along surfaces
    // rather than getting fully stuck when only one axis is blocked.
    const resolvedX = isOverlapping(pos.x + dx, pos.z) !== true ? pos.x + dx : pos.x
    const resolvedZ = isOverlapping(resolvedX, pos.z + dz) !== true ? pos.z + dz : pos.z

    // If tap-to-move is active and both axes were completely blocked this frame,
    // cancel immediately rather than waiting for the stuck timer.
    const isMovingIntent = dx !== 0 || dz !== 0
    const isFullyBlocked = resolvedX === pos.x && resolvedZ === pos.z
    if (isMovingIntent === true && isFullyBlocked === true && store.tapDestination !== null) {
      store.clearTapDestination()
      lastDistToDestination = Infinity
    }

    pos.x = resolvedX
    pos.z = resolvedZ

    store.updateNearbyEntity()
  }

  return { tick }
}
