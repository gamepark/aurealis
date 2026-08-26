import { isMoveItemType } from '@gamepark/rules-api'
import { HAND_SIZE } from '../Constants'
import { BASE_CAMP_COST } from '../material/BaseCamp'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { AurealisItemMove, AurealisMove, AurealisRule } from './AurealisRule'
import { RuleId } from './RuleId'

/** What a hand is down to once the price of a Camp de base action is paid. */
const HAND_LEFT = HAND_SIZE - BASE_CAMP_COST

/**
 * The price of a Camp de base action: 3 Adventurer cards discarded from the hand, face up
 * (rulebook p.9). The power was chosen before the discard and is waiting in the queue, so the last
 * card discarded is what sets it off.
 *
 * The cards are given up one at a time. Which ones is entirely the player's call: a Camp de base
 * action is also how a hand nobody can play is renewed.
 *
 * Nothing is counted here: a hand always holds 5 cards when a turn begins, so the price is paid the
 * moment 2 are left. It always can be — the deck and the discard hold 38 cards between them at all
 * times, so step IV never leaves a hand short.
 */
export class BaseCampDiscardRule extends AurealisRule {
  getPlayerMoves(): AurealisMove[] {
    return this.hand().moveItems({ type: LocationType.AdventurerDiscard })
  }

  afterItemMove(move: AurealisItemMove): AurealisMove[] {
    if (isMoveItemType(MaterialType.AdventurerCard)(move) && move.location.type === LocationType.AdventurerDiscard) {
      return this.hand().length > HAND_LEFT ? [] : [this.startRule(RuleId.ResolveEffects)]
    }
    return super.afterItemMove(move)
  }
}
