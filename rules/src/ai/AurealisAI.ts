import { applyAutomaticMoves, isCustomMoveType, isMoveItemType, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { AurealisRules } from '../AurealisRules'
import { CustomMoveType } from '../rules/CustomMoveType'
import { RuleId } from '../rules/RuleId'
import { draftValue } from './Draft'
import { evaluate } from './Evaluation'
import { sendArchaeologist, walkArchaeologist } from './Pawns'

/**
 * An automatic player for Aurealis.
 *
 * It plays one move at a time, the way a player does, and picks it the same way each time: every
 * legal move is played out on a copy of the game, consequences and all, and the position it leads
 * to is priced by {@link evaluate}. The move that leads to the best position is the one played.
 *
 * Playing the move out rather than reading it is what lets one measure serve every step of the
 * game: a card played is worth the effects it queues, a pawn walked is worth the Dig Site it draws
 * nearer, a Jungle card bought is worth the Temple tile it promises. None of that has to be spelled
 * out per rule — the rules themselves work it out, and the evaluation reads the outcome.
 *
 * Three cases sit outside that:
 *
 * - the draw, where the card picked is not knowable and playing it out would be reading a card the
 *   player is not allowed to read. It is weighed off the backs instead (see {@link draftValue});
 * - the Archaeologists, walked and sent by the orders of {@link Pawns} rather than by measure: what
 *   one step of one pawn is worth is next to nothing until the card it works on is filled, and a
 *   measure that reads every step as next to nothing spreads the team over the whole row;
 * - a Camp de base action, which the position it leads to flatters: the 3 cards it costs are still
 *   in hand at the moment it is chosen. It carries the price of those cards as a penalty, which is
 *   also what makes it what it should be — a last resort, taken when nothing else is worth doing,
 *   or when 7 gold buys a Jungle card that no other route offers.
 *
 * The bot never reads what a player could not: card fronts only on its own stand, and the Jungle
 * deck only where the game turns it face up.
 */

export type AurealisGame = MaterialGame<number, MaterialType, LocationType, RuleId>
export type AurealisAiMove = MaterialMove<number, MaterialType, LocationType, RuleId>

/**
 * What a Camp de base action really costs: 3 Adventurer cards, where every other action costs one.
 * Priced here rather than in the evaluation because the discard has not happened yet when the power
 * is chosen (see {@link BaseCampDiscardRule}).
 *
 * Far more than those 3 cards are worth on the stand, and deliberately so. A hand fills back up to 5
 * at step IV whatever was played out of it, so counted card by card the price comes to about one
 * point — and a bot that pays only that takes the Camp de base at every dull turn and loses: over
 * 120 games played from both seats, the real price of the cards went down 39 to 81 against this
 * flat one, and the real price plus an allowance for the 3 backs drawn blind went down 46 to 74.
 *
 * What the flat price stands for is the turn, not the cards. {@link handOfCardsValue} weighs a hand
 * as its best card and little else, so it cannot see what a hand cut to 2 cards costs on the turns
 * that follow; until it can, this number says it instead.
 */
const BASE_CAMP_PENALTY = 20

export const AurealisAI = async (game: AurealisGame, player: number): Promise<AurealisAiMove[]> => {
  const move = chooseMove(game, player)
  return move ? [move] : []
}

/** The move the bot would play, exposed on its own so that it can be tested without a promise. */
export const chooseMove = (game: AurealisGame, player: number): AurealisAiMove | undefined => {
  const rules = new AurealisRules(game)
  const moves = rules.getLegalMoves(player)
  if (moves.length <= 1) return moves[0]
  switch (game.rule?.id) {
    case RuleId.RefillHand:
      return bestMove(moves, (move) => (isMoveItemType(MaterialType.AdventurerCard)(move) ? draftValue(rules, player, move.itemIndex) : 0))
    case RuleId.MoveArchaeologists:
      return walkArchaeologist(rules, player, moves) ?? bestMove(moves, (move) => scoreMove(game, player, move))
    case RuleId.SendArchaeologists:
      return sendArchaeologist(rules, player, moves) ?? bestMove(moves, (move) => scoreMove(game, player, move))
    default:
      return bestMove(moves, (move) => scoreMove(game, player, move))
  }
}

/** The first of the moves to reach the highest score. */
const bestMove = (moves: AurealisAiMove[], score: (move: AurealisAiMove) => number): AurealisAiMove => {
  let best = moves[0]
  let bestScore = -Infinity
  for (const move of moves) {
    const value = score(move)
    if (value > bestScore) {
      bestScore = value
      best = move
    }
  }
  return best
}

/** The position the move leads to, once the rules have played out everything that follows from it. */
const scoreMove = (game: AurealisGame, player: number, move: AurealisAiMove): number => {
  const next: AurealisGame = JSON.parse(JSON.stringify(game))
  try {
    applyAutomaticMoves(new AurealisRules(next), [JSON.parse(JSON.stringify(move))])
  } catch {
    // A move the rules cannot play out is a move the bot has no business playing.
    return -Infinity
  }
  return evaluate(new AurealisRules(next), player) - penalty(move)
}

const penalty = (move: AurealisAiMove): number => (isCustomMoveType(CustomMoveType.BaseCampPower)(move) ? BASE_CAMP_PENALTY : 0)
