import type { EcsWorld } from "../world"

/** Updates world.time.delta and world.time.elapsed each frame. */
export function timeSystem({ world }: { world: EcsWorld }) {
  const now = performance.now()
  const delta = now - world.time.then
  world.time.delta = delta
  world.time.elapsed += delta
  world.time.then = now
}
