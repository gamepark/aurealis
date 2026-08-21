import { getEnumValues } from '@gamepark/rules-api'

/**
 * The 9 Legendary Animal tiles, all different.
 *
 * The 9 Relic tiles are identical to one another, and the Instant Victory tile is unique, so
 * neither needs an id enum of its own.
 */
export enum LegendaryAnimal {
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

export const legendaryAnimals = getEnumValues(LegendaryAnimal)
