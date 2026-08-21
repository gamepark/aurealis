import { getEnumValues } from '@gamepark/rules-api'

/**
 * The 4 Fame tiles. Each is held by whoever currently leads on its criterion, and moves from one
 * player to the other during the game.
 */
export enum Fame {
  /** 3 Plant symbols */
  Plant = 1,
  /** 3 Jungle cards */
  Jungle,
  /** 2 Legendary Animal tiles */
  LegendaryAnimal,
  /** 2 Relic tiles */
  Relic
}

export const fames = getEnumValues(Fame)
