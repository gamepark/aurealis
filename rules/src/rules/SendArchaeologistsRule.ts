import { CustomMove, isCustomMoveType, isMoveItemType } from '@gamepark/rules-api'
import { MaterialType } from '../material/MaterialType'
import { Memory } from '../Memory'
import { AurealisItemMove, AurealisMove, AurealisRule, isOnJungleCard } from './AurealisRule'
import { CustomMoveType } from './CustomMoveType'
import { RuleId } from './RuleId'

/** One Archaeologist and everywhere they may be sent, which is every Jungle card but their own. */
type Departure = { pawn: number, cards: number[] }

/**
 * "Send an Archaeologist onto any Jungle card, from your Camp de base or from another Jungle card"
 * (rulebook p.12): distance costs nothing here, which is what sets this apart from the moves of
 * {@link MoveArchaeologistsRule}.
 *
 * Pawns are sent one at a time, and nothing is ever declined. What is left is lost when there is
 * nowhere to send anyone: a player with a single Jungle card and every pawn already on it.
 *
 * Anywhere means as many destinations as there are cards, so the player is asked twice: which pawn
 * leaves, then where it goes. Only the second question is a move. The first one never leaves the
 * screen of the player making it (see {@link CustomMoveType.SelectArchaeologist}): it is played
 * locally, it is absent from the legal moves — nothing that decides nothing belongs there — and the
 * rules go on accepting every pawn whatever has been picked.
 */
export class SendArchaeologistsRule extends AurealisRule {
  onRuleStart(): AurealisMove[] {
    this.forget(Memory.SelectedArchaeologist)
    this.memorize(Memory.Remaining, this.currentEffectCount)
    return this.departures.length ? [] : [this.startRule(RuleId.ResolveEffects)]
  }

  /** The pawn the player has picked, on their own screen: nothing else in the game knows about it. */
  get selectedArchaeologist(): number | undefined {
    return this.remind<number | undefined>(Memory.SelectedArchaeologist)
  }

  getPlayerMoves(): AurealisMove[] {
    const departures = this.departures
    const selected = this.selectedArchaeologist
    const moves: AurealisMove[] = []
    for (const { pawn, cards } of departures) {
      if (selected === undefined || selected === pawn) {
        moves.push(...cards.map((card) => this.sendPawn(pawn, card)))
      }
    }
    return moves
  }

  /** Every Archaeologist with somewhere to go: the whole team of the camp, and every pawn on a card. */
  get departures(): Departure[] {
    const cards = this.jungleCards().getIndexes()
    if (!cards.length) return []
    const departures: Departure[] = this.campArchaeologists.getIndexes().map((pawn) => ({ pawn, cards }))
    for (const from of cards) {
      const destinations = cards.filter((card) => card !== from)
      if (!destinations.length) continue
      departures.push(...this.archaeologistsOn(from).map((pawn) => ({ pawn, cards: destinations })))
    }
    return departures
  }

  get sendMoves(): AurealisMove[] {
    return this.departures.flatMap(({ pawn, cards }) => cards.map((card) => this.sendPawn(pawn, card)))
  }

  private sendPawn(pawn: number, card: number): AurealisMove {
    return this.material(MaterialType.ArchaeologistPawn).index(pawn).moveItem(this.archaeologistDestination(card))
  }

  /** Picking the same pawn twice unpicks it, which is the way back out of a choice made by mistake. */
  onCustomMove(move: CustomMove): AurealisMove[] {
    if (!isCustomMoveType(CustomMoveType.SelectArchaeologist)(move)) return super.onCustomMove(move)
    const pawn = move.data as number
    if (this.selectedArchaeologist === pawn) this.forget(Memory.SelectedArchaeologist)
    else this.memorize(Memory.SelectedArchaeologist, pawn)
    return []
  }

  afterItemMove(move: AurealisItemMove): AurealisMove[] {
    const consequences = super.afterItemMove(move)
    if (isMoveItemType(MaterialType.ArchaeologistPawn)(move) && isOnJungleCard(move.location.type)) {
      this.forget(Memory.SelectedArchaeologist)
      return [...consequences, ...this.spendOne(this.departures.length > 0)]
    }
    return consequences
  }
}
