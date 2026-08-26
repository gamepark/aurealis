import { getEnumValues } from '@gamepark/rules-api'
import { buyJungle, Effect, movesOrGold, placeAnimals, sendArchaeologists } from './Effect'

/** The 6 Temple tiles; 4 are drawn at random for a game, the other 2 go back in the box. */
export enum Temple {
  Temple1 = 1,
  Temple2,
  Temple3,
  Temple4,
  Temple5,
  Temple6
}

export const temples = getEnumValues(Temple)

/**
 * What a Temple tile gives the moment it is taken (rulebook p.12), read off the tile artwork: the
 * split gold-and-pawn icon is a gain to be spread between moves and Pièces d'or, the paw print is
 * Animal pawns, the pawn with a curved arrow is Archaeologists sent anywhere, and a green card is a
 * Jungle card bought at the price shown.
 */
const templeEffects: Record<Temple, Effect[]> = {
  /** The 3 cards at the bottom of the Jungle deck, one of them bought for 3 gold. */
  [Temple.Temple1]: [buyJungle(3, true)],
  [Temple.Temple2]: [sendArchaeologists(4)],
  [Temple.Temple3]: [movesOrGold(9)],
  [Temple.Temple4]: [placeAnimals(4)],
  [Temple.Temple5]: [movesOrGold(6)],
  [Temple.Temple6]: [buyJungle(1)]
}

export const getTempleEffects = (temple: Temple): Effect[] => templeEffects[temple]

/**
 * One Temple tile is worth a Plant symbol for the Fame objective, on top of its effect: the Plant
 * icon is printed on the tile itself, so it keeps counting once the effect is long gone.
 */
const templePlantIcons: Record<Temple, number> = {
  [Temple.Temple1]: 0,
  [Temple.Temple2]: 0,
  [Temple.Temple3]: 0,
  [Temple.Temple4]: 0,
  [Temple.Temple5]: 1,
  [Temple.Temple6]: 0
}

export const getTemplePlantIcons = (temple: Temple): number => templePlantIcons[temple]
