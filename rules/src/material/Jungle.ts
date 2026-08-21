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
