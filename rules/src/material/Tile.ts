import { getEnumValues } from '@gamepark/rules-api'

/** The 6 Temple tiles; 4 are drawn at random for a game, the other 2 go back in the box. */
export enum TempleTile {
  Temple1 = 1,
  Temple2,
  Temple3,
  Temple4,
  Temple5,
  Temple6
}

/** The 4 Fame tiles. Each is held by whoever currently leads on its criterion, and can change hands. */
export enum FameTile {
  /** 3 Plant symbols */
  Plant = 1,
  /** 3 Jungle cards */
  Jungle,
  /** 2 Legendary Animal tiles */
  LegendaryAnimal,
  /** 2 Relic tiles */
  Relic
}

/** The 9 Legendary Animal tiles, all different. */
export enum LegendaryAnimalTile {
  LegendaryAnimal1 = 1,
  LegendaryAnimal2,
  LegendaryAnimal3,
  LegendaryAnimal4,
  LegendaryAnimal5,
  LegendaryAnimal6,
  LegendaryAnimal7,
  LegendaryAnimal8,
  LegendaryAnimal9
}

export const templeTiles = getEnumValues(TempleTile)
export const fameTiles = getEnumValues(FameTile)
export const legendaryAnimalTiles = getEnumValues(LegendaryAnimalTile)

/** The 9 Relic tiles are identical, and so is the single Instant Victory tile: they need no id. */
