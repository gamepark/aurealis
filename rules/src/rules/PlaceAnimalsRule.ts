import { isCreateItemType } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Memory } from '../Memory'
import { AurealisItemMove, AurealisMove, AurealisRule } from './AurealisRule'
import { RuleId } from './RuleId'

/**
 * Animal pawns put on the free Animal spaces of one's own Jungle cards, one at a time.
 *
 * Only the card is chosen, never the space: the spaces of a card are filled from the bottom up and
 * count for nothing but their number — the Bonus Animal comes when the last one is taken, which
 * {@link AurealisRule} watches for.
 *
 * Placing is not optional: an Animal pawn is never a bad thing to put down, and the rulebook gives
 * no way out. The only way to lose one is to have nowhere to put it — "si vous n'avez plus
 * d'emplacement, les pions sont perdus" (rulebook p.12) — and that is settled by the rules, not by
 * the player: the moment the last free space is taken, whatever is left of the effect is gone.
 */
export class PlaceAnimalsRule extends AurealisRule {
  onRuleStart(): AurealisMove[] {
    this.memorize(Memory.Remaining, this.currentEffectCount)
    return this.jungleCardsWithFreeAnimalSpace.length ? [] : [this.startRule(RuleId.ResolveEffects)]
  }

  getPlayerMoves(): AurealisMove[] {
    return this.jungleCardsWithFreeAnimalSpace.map((card) =>
      this.material(MaterialType.AnimalPawn).createItem({ location: { type: LocationType.JungleAnimalSpace, parent: card } })
    )
  }

  afterItemMove(move: AurealisItemMove): AurealisMove[] {
    const consequences = super.afterItemMove(move)
    if (!isCreateItemType(MaterialType.AnimalPawn)(move) || move.item.location.type !== LocationType.JungleAnimalSpace) return consequences
    return [...consequences, ...this.spendOne(this.jungleCardsWithFreeAnimalSpace.length > 0)]
  }
}
