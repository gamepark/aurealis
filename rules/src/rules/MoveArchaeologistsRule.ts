import { CustomMove, isCustomMoveType, isMoveItemType, isMoveItemTypeAtOnce } from '@gamepark/rules-api'
import { archaeologistsLeavingCamp, archaeologistsLeavingTogether } from '../material/Archaeologists'
import { EffectType } from '../material/Effect'
import { MaterialType } from '../material/MaterialType'
import { Memory } from '../Memory'
import { AurealisItemMove, AurealisMove, AurealisRule, isOnJungleCard } from './AurealisRule'
import { CustomMoveType } from './CustomMoveType'
import { RuleId } from './RuleId'

/**
 * Archaeologist moves. One move takes a pawn onto an adjacent card, and the Camp de base is the card
 * before the first Jungle one: reaching the second Jungle card from the camp costs 2 (rulebook p.7).
 *
 * They are spent one at a time, save for the one shortcut the display asks for: a whole team stepping
 * right together, worth one move per pawn of it and offered wherever more than one pawn can take it
 * (see {@link moveTogetherMoves}). It plays no move the single one could not, several times over.
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
    const moves = [...this.moveMoves, ...this.moveTogetherMoves]
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
    for (const pawn of archaeologistsLeavingCamp(this, this.player)) {
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

  /**
   * The whole team of one place walking right together, worth as many moves as there are pawns in it.
   *
   * Rightwards only, and one card at a time all the same: going deeper into the jungle is what a
   * player spends moves on, and a group is nothing but the same step taken by several pawns, so a
   * button playing it says exactly what the single one says and how many times over.
   *
   * A team is the pawns nothing is given up by walking on: the heap of the Camp de base, and the
   * ones gathered in the middle of a card (see {@link archaeologistsLeavingTogether}). Whoever
   * stands on a printed slot is building a Dig Site and stays out of it, so the group stops at the
   * middle of the card however many moves are left to spend.
   *
   * Only offered where it is worth a button — two pawns or more — since a group of one is the single
   * move already on the table.
   */
  get moveTogetherMoves(): AurealisMove[] {
    const row = this.jungleRow
    if (!row.length) return []
    // Every place a team stands, and the card one step to the right of it. The Camp de base is the
    // card before the first Jungle one, and the last card of the row leads nowhere.
    const departures = [
      { pawns: archaeologistsLeavingCamp(this, this.player), to: row[0] },
      ...row.slice(0, -1).map((card, x) => ({ pawns: archaeologistsLeavingTogether(this, card), to: row[x + 1] }))
    ]
    return departures.flatMap(({ pawns, to }) => {
      const group = this.groupSize(pawns.length, to)
      return group > 1 ? [this.material(MaterialType.ArchaeologistPawn).index(pawns.slice(0, group)).moveItemsAtOnce(this.archaeologistDestination(to))] : []
    })
  }

  /**
   * How many pawns of one team walk right together: never more than the moves left to spend, and
   * never more than land in the same spot of the card they reach.
   *
   * That second limit is what makes the group one move rather than two: the printed slots of a card
   * are filled before its middle, so a group overrunning the last free slot would be two moves to
   * two different places. It stops at the slots instead, and what is left of the team follows on
   * another press of the button. A card with no slot left to take gathers everyone in its middle,
   * which holds a whole team.
   */
  private groupSize(pawns: number, card: number): number {
    const freeSlots = this.freeArchaeologistSlots(card)
    return Math.min(pawns, this.remaining, freeSlots > 0 ? freeSlots : Infinity)
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
    // A group walking together costs one move per pawn of it.
    if (isMoveItemTypeAtOnce(MaterialType.ArchaeologistPawn)(move) && isOnJungleCard(move.location.type)) {
      return [...consequences, ...this.spend(move.indexes.length, this.canMove)]
    }
    return consequences
  }
}
