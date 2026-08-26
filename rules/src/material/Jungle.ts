import { getEnumValues } from '@gamepark/rules-api'

/**
 * The 20 Jungle cards. A simple id is enough: both faces of a card belong to that card, so knowing
 * either one identifies it. The verso is not a hidden back but the *completed face*, turned over
 * once the Dig Site and Animal bonuses have both been taken (rulebook p.5).
 */
export enum Jungle {
  Jungle1 = 1,
  Jungle2,
  Jungle3,
  Jungle4,
  Jungle5,
  Jungle6,
  Jungle7,
  Jungle8,
  Jungle9,
  Jungle10,
  Jungle11,
  Jungle12,
  Jungle13,
  Jungle14,
  Jungle15,
  Jungle16,
  Jungle17,
  Jungle18,
  Jungle19,
  Jungle20
}

export const jungles = getEnumValues(Jungle)

/**
 * How many spaces of each kind a card carries, counted off the artwork.
 *
 * The rules need both: a Dig Site may only be built once every Archaeologist space of the card is
 * occupied (rulebook p.7), and the Animal bonus is taken once every Animal space is (p.5). The
 * display needs them too, because each column is aligned on the bottom of the card — a card with
 * fewer spaces is missing the *top* ones — so where the first space of a column sits cannot be
 * known from the card alone.
 */
const archaeologistSpaces: Record<Jungle, number> = {
  [Jungle.Jungle1]: 2,
  [Jungle.Jungle2]: 2,
  [Jungle.Jungle3]: 1,
  [Jungle.Jungle4]: 2,
  [Jungle.Jungle5]: 3,
  [Jungle.Jungle6]: 1,
  [Jungle.Jungle7]: 4,
  [Jungle.Jungle8]: 4,
  [Jungle.Jungle9]: 3,
  [Jungle.Jungle10]: 1,
  [Jungle.Jungle11]: 3,
  [Jungle.Jungle12]: 2,
  [Jungle.Jungle13]: 2,
  [Jungle.Jungle14]: 3,
  [Jungle.Jungle15]: 2,
  [Jungle.Jungle16]: 2,
  [Jungle.Jungle17]: 3,
  [Jungle.Jungle18]: 3,
  [Jungle.Jungle19]: 4,
  [Jungle.Jungle20]: 3
}

export const getArchaeologistSpaces = (jungle: Jungle): number => archaeologistSpaces[jungle]

const animalSpaces: Record<Jungle, number> = {
  [Jungle.Jungle1]: 1,
  [Jungle.Jungle2]: 4,
  [Jungle.Jungle3]: 2,
  [Jungle.Jungle4]: 3,
  [Jungle.Jungle5]: 3,
  [Jungle.Jungle6]: 2,
  [Jungle.Jungle7]: 3,
  [Jungle.Jungle8]: 4,
  [Jungle.Jungle9]: 4,
  [Jungle.Jungle10]: 4,
  [Jungle.Jungle11]: 1,
  [Jungle.Jungle12]: 3,
  [Jungle.Jungle13]: 3,
  [Jungle.Jungle14]: 2,
  [Jungle.Jungle15]: 2,
  [Jungle.Jungle16]: 3,
  [Jungle.Jungle17]: 2,
  [Jungle.Jungle18]: 3,
  [Jungle.Jungle19]: 2,
  [Jungle.Jungle20]: 1
}

export const getAnimalSpaces = (jungle: Jungle): number => animalSpaces[jungle]
