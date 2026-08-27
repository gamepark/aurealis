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
