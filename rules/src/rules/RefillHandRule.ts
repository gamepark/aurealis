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
 * sans les remplacer ni regarder leurs effets" (rulebook p.11). It goes onto the stand all the same,
 * where it belongs — face down, which on a stand is a rotated card hidden from its owner as much as
 * from the opponent (see {@link AurealisRules.hidingStrategies}). Nothing waits anywhere else: a
 * card taken is a card in hand, only one nobody may read yet.
 *
 * The last card of the draw has nothing left to hide, since no other card will be picked after it,
 * so it lands face up. Which means an ordinary turn — one card played, one card drawn — never turns
 * a card face down at all.
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
    const missing = HAND_SIZE - this.hand().length
    if (missing <= 0) return []
    return this.river.moveItems({ type: LocationType.PlayerHand, player: this.player, ...(missing > 1 ? { rotation: true } : {}) })
  }

  /** The cards just drawn that are still lying face down on the stand. */
  get faceDownCards(): AurealisMaterial {
    return this.hand().filter((item) => !!item.location.rotation)
  }

  /**
   * A card taken from the river. The cards turned over at the end of the turn are not one of those:
   * they turn over together, in a single move (see {@link endOfTurn}), which is what keeps this from
   * ending the same turn twice.
   */
  afterItemMove(move: AurealisItemMove): AurealisMove[] {
    if (isMoveItemType(MaterialType.AdventurerCard)(move) && move.location.type === LocationType.PlayerHand) {
      return this.drawMoves.length ? [] : this.endOfTurn()
    }
    return super.afterItemMove(move)
  }

  /**
   * The hand is full: whatever is still face down on the stand turns over. All of it in one move —
   * the cards were picked without being read, and their owner discovers them together.
   */
  endOfTurn(): AurealisMove[] {
    const faceDown = this.faceDownCards
    return [
      ...(faceDown.length ? [faceDown.moveItemsAtOnce({ type: LocationType.PlayerHand, player: this.player })] : []),
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
