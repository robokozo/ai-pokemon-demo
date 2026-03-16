import { usePhysicsStore } from "./usePhysicsStore"

/** Lazy-load Rapier WASM and initialize it. Call once at app startup. */
export async function initPhysics() {
  const store = usePhysicsStore()
  if (store.isReady === true) return

  const RAPIER = await import("@dimforge/rapier3d-compat")
  await RAPIER.init()
  store.rapier = RAPIER
  store.isReady = true
}
