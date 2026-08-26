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
