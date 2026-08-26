import { isMoveItemType } from '@gamepark/rules-api'
import { HAND_SIZE, JUNGLE_MARKET_SIZE, RIVER_SIZE } from '../Constants'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { AurealisItemMove, AurealisMaterial, AurealisMove, AurealisRule } from './AurealisRule'
import { RuleId } from './RuleId'

/**
 * Step IV, the end of a turn (rulebook p.11). The player draws from the river up to 5 cards, and
 * only once they are done are the river and the Jungle market filled up again — which is what makes
 * the 3 cards drawn after a Camp de base action a single pick among the same 5 backs.
 *
 * A drawn card is not read before the last one is picked: "sélectionnez vos cartes d'un seul coup,
 * sans les remplacer ni regarder leurs effets" (rulebook p.11). Hence {@link LocationType.DrawnCards}
 * between the river and the hand — the cards wait there face down, backs up, and all turn over at
 * once when the hand is full.
 */
export class RefillHandRule extends AurealisRule {
  onRuleStart(): AurealisMove[] {
    return this.drawMoves.length ? [] : this.endOfTurn()
  }

  getPlayerMoves(): AurealisMove[] {
    return this.drawMoves
  }

  /**
   * The 5 visible backs of the river, as long as the hand is short of 5 cards. Taking the top of
   * the deck uncovers the next one, which is then the fifth back and can be taken in turn.
   */
  get drawMoves(): AurealisMove[] {
    if (this.hand().length + this.drawnCards.length >= HAND_SIZE) return []
    return this.river.moveItems({ type: LocationType.DrawnCards, player: this.player })
  }

  get drawnCards(): AurealisMaterial {
    return this.adventurers.location(LocationType.DrawnCards).player(this.player)
  }

  afterItemMove(move: AurealisItemMove): AurealisMove[] {
    if (isMoveItemType(MaterialType.AdventurerCard)(move) && move.location.type === LocationType.DrawnCards) {
      return this.drawMoves.length ? [] : this.endOfTurn()
    }
    return super.afterItemMove(move)
  }

  /** The drawn cards join the stand — and only there does their owner get to read them. */
  endOfTurn(): AurealisMove[] {
    return [
      ...this.drawnCards.moveItems({ type: LocationType.PlayerHand, player: this.player }),
      ...this.refillRiver(),
      ...this.refillJungleMarket(),
      this.startPlayerTurn(RuleId.ChooseAction, this.nextPlayer)
    ]
  }

  /**
   * The river back to 4 cards beside the deck. When the deck runs short the discard is shuffled and
   * takes over: the cards missing are dealt straight from it, and what is left of it becomes the new
   * deck (rulebook p.11).
   */
  refillRiver(): AurealisMove[] {
    const missing = RIVER_SIZE - this.adventurers.location(LocationType.AdventurerRiver).length
    if (missing <= 0) return []
    const deck = this.adventurerDeck.deck()
    const fromDeck = Math.min(missing, this.adventurerDeck.length)
    const moves: AurealisMove[] = deck.deal({ type: LocationType.AdventurerRiver }, fromDeck)
    const discard = this.adventurers.location(LocationType.AdventurerDiscard)
    if (fromDeck === missing || !discard.length) return moves
    if (discard.length > 1) moves.push(discard.shuffle())
    const reshuffled = discard.deck()
    moves.push(...reshuffled.deal({ type: LocationType.AdventurerRiver }, Math.min(missing - fromDeck, discard.length)))
    moves.push(...reshuffled.moveItems({ type: LocationType.AdventurerDeck }))
    return moves
  }

  /** The Jungle market back to 3 cards accessible, the top of the deck being one of them. */
  refillJungleMarket(): AurealisMove[] {
    const missing = JUNGLE_MARKET_SIZE - this.material(MaterialType.JungleCard).location(LocationType.JungleMarket).length
    if (missing <= 0) return []
    return this.jungleDeck.deck().deal({ type: LocationType.JungleMarket }, Math.min(missing, this.jungleDeck.length))
  }
}
