import { CustomMove, isCustomMoveType, isMoveItemType } from '@gamepark/rules-api'
import { EffectType } from '../material/Effect'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Memory } from '../Memory'
import { AurealisItemMove, AurealisMove, AurealisRule, isOnJungleCard } from './AurealisRule'
import { CustomMoveType } from './CustomMoveType'
import { RuleId } from './RuleId'

/**
 * Archaeologist moves, spent one at a time. One move takes a pawn onto an adjacent card, and the
 * Camp de base is the card before the first Jungle one: reaching the second Jungle card from the
 * camp costs 2 (rulebook p.7).
 *
 * Moves are the one gain a player may use only in part: walking a pawn away from a card whose
 * spaces they were filling can cost them the Dig Site they were building, so the rules never force
 * them out. Every other gain of the game is applied in full.
 *
 * Some cards and Temple tiles hand out moves *or* gold, to be split as the player likes: each unit
 * left is worth 1 gold instead, which is how the rulebook example spends 3 of its 6 moves and takes
 * 3 gold for the rest (p.7). Nothing is given up there, so those come with no way out.
 *
 * The gold is taken in one go, and it ends the effect: a player walks first, then cashes in what
 * they did not use.
 *
 * A pawn only ever goes onto a Jungle card, never back to the camp: the trip back is nothing but a
 * move wasted, and a card that has been completed is still a card one can walk across.
 */
export class MoveArchaeologistsRule extends AurealisRule {
  onRuleStart(): AurealisMove[] {
    this.memorize(Memory.Remaining, this.currentEffectCount)
    return this.canMove ? [] : [this.startRule(RuleId.ResolveEffects)]
  }

  /** One Jungle card and every pawn already on it: there is no adjacent card to walk to. */
  get canMove(): boolean {
    return this.goldAllowed || this.moveMoves.length > 0
  }

  get goldAllowed(): boolean {
    return this.currentEffect().type === EffectType.MovesOrGold
  }

  getPlayerMoves(): AurealisMove[] {
    const moves = this.moveMoves
    if (this.goldAllowed) moves.push(this.takeGold(this.remaining))
    else moves.push(this.customMove(CustomMoveType.Pass))
    return moves
  }

  /** The player's Jungle cards from the Camp de base outwards: two cards are adjacent in this row. */
  get jungleRow(): number[] {
    return this.jungleCards()
      .sort((card) => card.location.x ?? 0)
      .getIndexes()
  }

  get moveMoves(): AurealisMove[] {
    const row = this.jungleRow
    if (!row.length) return []
    const moves: AurealisMove[] = []
    for (const pawn of this.material(MaterialType.ArchaeologistPawn).location(LocationType.BaseCampArchaeologists).player(this.player).getIndexes()) {
      moves.push(this.movePawn(pawn, row[0]))
    }
    row.forEach((card, x) => {
      const neighbours = [x - 1, x + 1].filter((neighbour) => neighbour >= 0 && neighbour < row.length)
      for (const pawn of this.archaeologistsOn(card)) {
        for (const neighbour of neighbours) {
          moves.push(this.movePawn(pawn, row[neighbour]))
        }
      }
    })
    return moves
  }

  private movePawn(pawn: number, card: number): AurealisMove {
    return this.material(MaterialType.ArchaeologistPawn).index(pawn).moveItem(this.archaeologistDestination(card))
  }

  /** Gold or nothing, both close the gain: what is left of it is spent either way. */
  onCustomMove(move: CustomMove): AurealisMove[] {
    if (isCustomMoveType(CustomMoveType.Pass)(move)) return this.spendOne(false)
    return [...super.onCustomMove(move), ...this.spendOne(false)]
  }

  afterItemMove(move: AurealisItemMove): AurealisMove[] {
    const consequences = super.afterItemMove(move)
    if (isMoveItemType(MaterialType.ArchaeologistPawn)(move) && isOnJungleCard(move.location.type)) {
      return [...consequences, ...this.spendOne(this.canMove)]
    }
    return consequences
  }
}
