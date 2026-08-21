import { getEnumValues } from '@gamepark/rules-api'

/**
 * The 4 Camp de base cards. One is drawn at random per player; they are purely cosmetic variants,
 * nothing in the game tells players apart (see the absence of a player identity in AurealisOptions).
 *
 * A simple id, like Jungle cards: face A (the improved one, used from the start of the game) and
 * face B (the standard one, identical in effect for every player) are the two sides of one card.
 */
export enum BaseCamp {
  BaseCamp1 = 1,
  BaseCamp2,
  BaseCamp3,
  BaseCamp4
}

export const baseCamps = getEnumValues(BaseCamp)
