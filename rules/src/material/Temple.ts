import { getEnumValues } from '@gamepark/rules-api'

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
