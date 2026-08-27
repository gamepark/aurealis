import { Material } from '@gamepark/rules-api'
import { LocationType } from './LocationType'
import { MaterialType } from './MaterialType'

/**
 * Anything that can read the game's material: a step of the rules as much as the {@link AurealisRules}
 * instance the display holds.
 *
 * What both of them need to know is asked here rather than in either of them. A button of the
 * interface that walks an Archaeologist off a card has to point at the very pawn the rules would
 * have picked, and a panel counting a player's gold has to count what the rules would let them
 * spend — the only way to be sure of that is for both to ask the same question.
 */
export type MaterialSource = { material(type: MaterialType): Material<number, MaterialType, LocationType> }
