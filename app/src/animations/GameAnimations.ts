import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { and, isMaterial, isMoveType, isMyMove, MaterialGameAnimations, not } from '@gamepark/react-game'
import { ItemMoveType } from '@gamepark/rules-api'

export const gameAnimations = new MaterialGameAnimations()

/**
 * The cards drawn face down turning over together at the end of a turn (see {@link RefillHandRule}).
 *
 * It is the one move of the game that reveals something, and it reveals it to a single player: the
 * one who drew them. On anybody else's screen — the opponent, a spectator — those cards are backs
 * before the move and the very same backs after it, so a second of animation is a second of watching
 * nothing happen. Skipped there, and left alone for the player it is played for.
 */
gameAnimations.configure(and(isMaterial(MaterialType.AdventurerCard), isMoveType(ItemMoveType.MoveAtOnce), not(isMyMove()))).skip()

/**
 * The Animal pawns a player puts down together on one Jungle card (see {@link PlaceAnimalsRule}).
 *
 * Creating items at once animates nothing by default — it is the move a game uses to lay out a whole
 * setup at no cost — so the shortcut that places 2 or 3 pawns in one go would drop them on the card
 * out of nowhere, while the very same pawns placed one at a time fly in from the reserve. A second,
 * the duration of every other creation, and the two ways of placing them look alike again.
 */
gameAnimations.configure(and(isMaterial(MaterialType.AnimalPawn), isMoveType(ItemMoveType.CreateAtOnce))).duration(1000)
