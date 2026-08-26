import { CustomMove, isCreateItemType, isCustomMoveType, isMoveItemType } from '@gamepark/rules-api'
import { TILES_TO_WIN } from '../Constants'
import { AdventurerId } from '../material/Adventurer'
import { getLineEffects, getPlayableLine } from '../material/AdventurerLines'
import { BASE_CAMP_COST, BaseCamp, BaseCampPower, getBaseCampPowerEffects, isImprovedPower } from '../material/BaseCamp'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Memory } from '../Memory'
import { AurealisItemMove, AurealisMove, AurealisRule } from './AurealisRule'
import { CustomMoveType } from './CustomMoveType'
import { RuleId } from './RuleId'

/**
 * Steps I and II of a turn (rulebook p.6). The end of the game is checked first, then the player
 * takes their one action.
 *
 * The three actions are offered as one list of moves rather than behind a first choice: playing a
 * card is that card going to the discard, building a Dig Site is the pawn landing on the card, and
 * a Camp de base action is picking the power — the 3 cards it costs are discarded afterwards, and
 * its effect waits for them.
 *
 * A card played goes to the discard at once, and its effects are resolved from there: the discard is
 * face up, so the card everyone has to read stays in plain sight on top of it (rulebook p.6).
 */
export class ChooseActionRule extends AurealisRule {
  /**
   * I. Check the end of the game. 7 tiles at the *start* of a turn wins, so a player who reaches 7
   * during their own turn has to survive the opponent's turn first (rulebook p.11).
   */
  onRuleStart(): AurealisMove[] {
    if (this.countTiles(this.player) >= TILES_TO_WIN) {
      this.memorize(Memory.Winner, this.player)
      return [this.endGame()]
    }
    return []
  }

  getPlayerMoves(): AurealisMove[] {
    return [...this.playCardMoves, ...this.buildDigSiteMoves, ...this.baseCampMoves]
  }

  /** A card can only be played if at least one of its conditions is met (rulebook p.6). */
  get playCardMoves(): AurealisMove[] {
    const cards = this.cardsInPlay
    return this.hand()
      .getIndexes()
      .filter((index) => {
        const card = this.adventurers.getItem<AdventurerId>(index).id.front
        return card !== undefined && getPlayableLine(card, cards) !== undefined
      })
      .map((index) => this.adventurers.index(index).moveItem({ type: LocationType.AdventurerDiscard }))
  }

  /**
   * A Dig Site is built on a Jungle card whose Archaeologist spaces are all taken, and it takes the
   * whole turn. One per turn since it is the action, and one per card since the card then holds the
   * pawn for good (rulebook p.7).
   */
  get buildDigSiteMoves(): AurealisMove[] {
    return this.jungleCards()
      .getIndexes()
      .filter((card) => this.isDigSiteReady(card))
      .map((card) => this.material(MaterialType.DigSitePawn).createItem({ location: { type: LocationType.JungleDigSiteBonus, parent: card } }))
  }

  /**
   * The four powers of a Camp de base. All of them cost 3 Adventurer cards, so a hand too small
   * offers none — which cannot happen at the start of a turn (rulebook p.9).
   */
  get baseCampMoves(): AurealisMove[] {
    if (this.hand().length < BASE_CAMP_COST) return []
    return [BaseCampPower.Gold, BaseCampPower.Animal, BaseCampPower.Moves, BaseCampPower.Jungle].map((power) =>
      this.customMove(CustomMoveType.BaseCampPower, power)
    )
  }

  get baseCamp() {
    return this.material(MaterialType.BaseCampCard).location(LocationType.BaseCamp).player(this.player)
  }

  /**
   * The power is chosen first and applied last: what it gives waits in the queue while the 3 cards
   * it costs are discarded. Picking the improved one turns the card onto its face B at once — it is
   * spent the moment it is chosen.
   */
  onCustomMove(move: CustomMove): AurealisMove[] {
    if (!isCustomMoveType(CustomMoveType.BaseCampPower)(move)) return []
    const power = move.data as BaseCampPower
    const camp = this.baseCamp.getItems<BaseCamp>()[0]
    const improved = !this.isCompleted(camp) && isImprovedPower(camp.id, power)
    this.pushEffects(getBaseCampPowerEffects(camp.id, power, improved))
    const moves: AurealisMove[] = improved ? [this.baseCamp.rotateItem(true)] : []
    moves.push(this.startRule(RuleId.BaseCampDiscard))
    return moves
  }

  /**
   * The conditions of a card are read on the whole hand *before* the card leaves it, so a card
   * always counts for its own condition (rulebook p.6). Hence here rather than after the move: the
   * consequences this returns are played once the card is down.
   *
   * A card reaching the discard during this step is a card being played: the 3 cards a Camp de base
   * action costs are given up in {@link BaseCampDiscardRule}, which is another step altogether.
   */
  beforeItemMove(move: AurealisItemMove): AurealisMove[] {
    if (isMoveItemType(MaterialType.AdventurerCard)(move) && move.location.type === LocationType.AdventurerDiscard) {
      const card = this.adventurers.getItem<AdventurerId>(move.itemIndex).id.front
      const cards = this.cardsInPlay
      const line = card !== undefined ? getPlayableLine(card, cards) : undefined
      if (line) this.pushEffects(getLineEffects(line, cards))
    }
    return []
  }

  afterItemMove(move: AurealisItemMove): AurealisMove[] {
    const consequences = super.afterItemMove(move)
    if (isMoveItemType(MaterialType.AdventurerCard)(move) && move.location.type === LocationType.AdventurerDiscard) {
      return [...consequences, this.startRule(RuleId.ResolveEffects)]
    }
    if (isCreateItemType(MaterialType.DigSitePawn)(move)) {
      return [...consequences, this.startRule(RuleId.ResolveEffects)]
    }
    return consequences
  }
}
