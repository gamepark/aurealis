import { Tile } from './Tile'

/**
 * The 4 Fame tiles. Each is held by whoever currently leads on its criterion, and moves from one
 * player to the other during the game.
 *
 * A named subset of {@link Tile}, like the other kinds of tile.
 */
export const Fame = {
  /** 3 Plant symbols */
  Plant: Tile.FamePlant,
  /** 3 Jungle cards */
  Jungle: Tile.FameJungle,
  /** 2 Legendary Animal tiles */
  LegendaryAnimal: Tile.FameLegendaryAnimal,
  /** 2 Relic tiles */
  Relic: Tile.FameRelic
} as const

export type Fame = (typeof Fame)[keyof typeof Fame]

export const fames: Fame[] = Object.values(Fame)

export const isFame = (tile: Tile): tile is Fame => fames.includes(tile as Fame)

/**
 * What it takes to hold a Fame tile (rulebook p.10). A tile is never won for good: at the end of a
 * turn its owner loses it to the other player as soon as that player *equals* them on the objective.
 */
export const fameThresholds: Record<Fame, number> = {
  [Fame.Plant]: 3,
  [Fame.Jungle]: 3,
  [Fame.LegendaryAnimal]: 2,
  [Fame.Relic]: 2
}
