import { Tile } from './Tile'

/**
 * The 9 Legendary Animal tiles, all different.
 *
 * A named subset of {@link Tile}. The 9 Relic tiles are identical to one another and the Instant
 * Victory tile is unique, so neither of those needs a subset of its own: {@link Tile.Relic} and
 * {@link Tile.InstantVictory} say all there is to say.
 */
export const LegendaryAnimal = {
  LegendaryAnimal1: Tile.LegendaryAnimal1,
  LegendaryAnimal2: Tile.LegendaryAnimal2,
  LegendaryAnimal3: Tile.LegendaryAnimal3,
  LegendaryAnimal4: Tile.LegendaryAnimal4,
  LegendaryAnimal5: Tile.LegendaryAnimal5,
  LegendaryAnimal6: Tile.LegendaryAnimal6,
  LegendaryAnimal7: Tile.LegendaryAnimal7,
  LegendaryAnimal8: Tile.LegendaryAnimal8,
  LegendaryAnimal9: Tile.LegendaryAnimal9
} as const

export type LegendaryAnimal = (typeof LegendaryAnimal)[keyof typeof LegendaryAnimal]

export const legendaryAnimals: LegendaryAnimal[] = Object.values(LegendaryAnimal)

export const isLegendaryAnimal = (tile: Tile): tile is LegendaryAnimal => legendaryAnimals.includes(tile as LegendaryAnimal)
