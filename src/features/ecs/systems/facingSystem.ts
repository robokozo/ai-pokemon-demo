import { query } from "bitecs"
import type { Ref } from "vue"
import type { EcsWorld } from "../world"

/**
 * Computes facing angle from the player's velocity.
 * Writes result to a reactive ref consumed by the player Vue component.
 */
export function facingSystem({ world, facing }: { world: EcsWorld; facing: Ref<number> }) {
  const { Velocity, PlayerTag } = world.components
  const players = query(world, [PlayerTag, Velocity])

  for (const eid of players) {
    const vx = Velocity.x[eid]
    const vz = Velocity.z[eid]
    if (vx !== 0 || vz !== 0) {
      facing.value = Math.atan2(vx, vz)
    }
  }
}
