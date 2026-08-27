import { getEnumValues } from '@gamepark/rules-api'

/**
 * Every tile of the game in one id space, because they are one material: 3 x 3 cm squares that end
 * up side by side in the same row in front of a player, where 7 of them win the game (rulebook
 * p.11). What tells them apart is how they are earned and what they are worth on the way — not what
 * they are made of, and not where they can go.
 *
 * One material type also means one sequence of positions in that row: four types would be four
 * independent sequences, and the first tile of each of them would claim the same first place.
 *
 * The four kinds are named subsets of this enum ({@link Temple}, {@link Fame},
 * {@link LegendaryAnimal}), so that a rule that only concerns one of them still says so.
 */
export enum Tile {
  Temple1 = 1,
  Temple2,
  Temple3,
  Temple4,
  Temple5,
  Temple6,

  FamePlant,
  FameJungle,
  FameLegendaryAnimal,
  FameRelic,

  /** The 9 Relic tiles are identical to one another: one id for all of them. */
  Relic,

  LegendaryAnimal1,
  LegendaryAnimal2,
  LegendaryAnimal3,
  LegendaryAnimal4,
  LegendaryAnimal5,
  LegendaryAnimal6,
  LegendaryAnimal7,
  LegendaryAnimal8,
  LegendaryAnimal9,

  /** Unique, and not a tile anybody collects: it is the game being over. */
  InstantVictory
}

export const tiles = getEnumValues(Tile)

/**
 * The three heaps of tiles the general supply keeps apart. They share {@link LocationType.Reserve}
 * and are told from one another by the `id` of their location, which is what gives each of them its
 * own row of positions: the Relic tiles are drawn as a pile, the Legendary Animals as a grid, and
 * the Instant Victory tile stands alone.
 */
export enum TilePile {
  Relic = 1,
  LegendaryAnimal,
  InstantVictory
}
