import { useSceneStore } from "./useSceneStore"
import type { EntityPosition } from "./useSceneStore"
import { useControls } from "./useControls"

const MOVE_SPEED = 0.05
const NPC_COLLISION_RADIUS = 0.7
const PLAYER_HALF = 0.3
const ARRIVE_THRESHOLD = 0.12
const STUCK_LIMIT = 30 // frames (~0.5s at 60fps)

export function usePlayerMovement({ controls, position }: { controls: ReturnType<typeof useControls>; position: EntityPosition }) {
  const store = useSceneStore()
  const { keys } = controls

  let stuckFrameCount = 0
  let lastX = 0
  let lastZ = 0

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
      } else {
        dx = (ddx / dist) * MOVE_SPEED
        dz = (ddz / dist) * MOVE_SPEED

        if (Math.abs(pos.x - lastX) < 0.001 && Math.abs(pos.z - lastZ) < 0.001) {
          stuckFrameCount++
          if (stuckFrameCount >= STUCK_LIMIT) {
            store.clearTapDestination()
          }
        } else {
          stuckFrameCount = 0
        }
      }
    }

    lastX = pos.x
    lastZ = pos.z

    const newX = pos.x + dx
    const newZ = pos.z + dz

    // Block against any entity registered as "solid"
    let isBlocked = false
    for (const entity of store.getInteractables().filter((e) => e.collider === "solid")) {
      if (entity.colliderSize !== undefined) {
        // AABB check for rectangular furniture
        const { hw, hd } = entity.colliderSize
        const ox = Math.abs(newX - entity.position.x)
        const oz = Math.abs(newZ - entity.position.z)
        if (ox < PLAYER_HALF + hw && oz < PLAYER_HALF + hd) {
          isBlocked = true
          break
        }
      } else {
        // Circle check for NPCs
        const ndx = newX - entity.position.x
        const ndz = newZ - entity.position.z
        const dist = Math.sqrt(ndx * ndx + ndz * ndz)
        if (dist < NPC_COLLISION_RADIUS) {
          isBlocked = true
          break
        }
      }
    }

    if (isBlocked !== true) {
      pos.x = newX
      pos.z = newZ
    }

    store.updateNearbyEntity()
  }

  return { tick }
}
