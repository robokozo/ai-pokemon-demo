import { createWorld } from "bitecs"

export type EntityKind = "player" | "npc" | "prop"

// Components are SoA (Struct of Arrays) for performance.
// bitECS v0.4 stores components on the world object.
const MAX_ENTITIES = 10_000

export interface EcsComponents {
  Position: { x: Float32Array; y: Float32Array; z: Float32Array }
  Velocity: { x: Float32Array; z: Float32Array }
  BoxCollider: { hw: Float32Array; hd: Float32Array }
  // Indices into side-tables that map to Rapier handles.
  RigidBodyRef: { index: Uint32Array }
  ColliderRef: { index: Uint32Array }
  SensorRef: { index: Uint32Array }
  // Tag components (SoA with no data — just used for queries).
  PlayerTag: Array<true | undefined>
  NpcTag: Array<true | undefined>
  StaticTag: Array<true | undefined>
  OccludableTag: Array<true | undefined>
  InteractiveTag: Array<true | undefined>
}

export interface EcsTime {
  delta: number
  elapsed: number
  then: number
}

export interface EcsWorldData {
  components: EcsComponents
  time: EcsTime
}

export function buildWorld() {
  return createWorld<EcsWorldData>({
    components: {
      Position: {
        x: new Float32Array(MAX_ENTITIES),
        y: new Float32Array(MAX_ENTITIES),
        z: new Float32Array(MAX_ENTITIES),
      },
      Velocity: {
        x: new Float32Array(MAX_ENTITIES),
        z: new Float32Array(MAX_ENTITIES),
      },
      BoxCollider: {
        hw: new Float32Array(MAX_ENTITIES),
        hd: new Float32Array(MAX_ENTITIES),
      },
      RigidBodyRef: { index: new Uint32Array(MAX_ENTITIES) },
      ColliderRef: { index: new Uint32Array(MAX_ENTITIES) },
      SensorRef: { index: new Uint32Array(MAX_ENTITIES) },
      PlayerTag: [],
      NpcTag: [],
      StaticTag: [],
      OccludableTag: [],
      InteractiveTag: [],
    },
    time: {
      delta: 0,
      elapsed: 0,
      then: performance.now(),
    },
  })
}

export type EcsWorld = ReturnType<typeof buildWorld>
