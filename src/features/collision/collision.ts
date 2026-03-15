import type { SceneEntity } from "../entities/entity"

export const PLAYER_HALF_EXTENT = 0.3
export const DEFAULT_CIRCLE_RADIUS = 0.7
const RAY_MARCH_STEP = 0.1

export function isPlayerOverlappingEntity({ playerX, playerZ, entity }: { playerX: number; playerZ: number; entity: SceneEntity }): boolean {
  if (entity.colliderSize !== undefined) {
    const { hw, hd } = entity.colliderSize
    return Math.abs(playerX - entity.position.x) < PLAYER_HALF_EXTENT + hw && Math.abs(playerZ - entity.position.z) < PLAYER_HALF_EXTENT + hd
  }
  return Math.sqrt((playerX - entity.position.x) ** 2 + (playerZ - entity.position.z) ** 2) < DEFAULT_CIRCLE_RADIUS
}

export function isPlayerOverlappingAny({ playerX, playerZ, entities }: { playerX: number; playerZ: number; entities: Array<SceneEntity> }): boolean {
  for (const entity of entities) {
    if (isPlayerOverlappingEntity({ playerX, playerZ, entity }) === true) {
      return true
    }
  }
  return false
}

export function resolveRayMarchDestination({
  fromX,
  fromZ,
  toX,
  toZ,
  solidEntities,
}: {
  fromX: number
  fromZ: number
  toX: number
  toZ: number
  solidEntities: Array<SceneEntity>
}): { x: number; z: number } {
  const dx = toX - fromX
  const dz = toZ - fromZ
  const totalDist = Math.sqrt(dx * dx + dz * dz)
  if (totalDist === 0) return { x: fromX, z: fromZ }

  const nx = dx / totalDist
  const nz = dz / totalDist

  let lastX = fromX
  let lastZ = fromZ
  let traveled = 0

  while (traveled < totalDist) {
    traveled = Math.min(traveled + RAY_MARCH_STEP, totalDist)
    const cx = fromX + nx * traveled
    const cz = fromZ + nz * traveled
    if (isPlayerOverlappingAny({ playerX: cx, playerZ: cz, entities: solidEntities }) === true) break
    lastX = cx
    lastZ = cz
  }

  return { x: lastX, z: lastZ }
}
