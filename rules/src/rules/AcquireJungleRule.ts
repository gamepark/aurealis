import { isMoveItemType } from '@gamepark/rules-api'
import { EffectOf, EffectType } from '../material/Effect'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { AurealisItemMove, AurealisMove, AurealisRule } from './AurealisRule'
import { RuleId } from './RuleId'

/**
 * Taking a Jungle card and laying it at the end of one's own row (rulebook p.5).
 *
 * The card is picked among the 3 of the market — the 2 laid beside the deck and the face-up top of
 * the deck itself — except for the Temple tile that reaches instead for the 3 cards at the *bottom*
 * of the deck, the ones nobody has seen (rulebook p.12). Those that are not bought are left where
 * they are, which is exactly "replacez les autres cartes dans la pioche".
 *
 * Buying is not optional — the rulebook hands the card out, it does not offer it. What can happen
 * is that there is nothing to buy, or not enough gold to pay for it: the effect is then lost.
 */
export class AcquireJungleRule extends AurealisRule {
  get cost(): number {
    return this.currentEffect<EffectOf<EffectType.BuyJungle>>().cost
  }

  get candidates(): number[] {
    const effect = this.currentEffect<EffectOf<EffectType.BuyJungle>>()
    if (!effect.fromDeckBottom) return this.jungleMarket.getIndexes()
    return this.jungleDeck
      .sort((card) => card.location.x ?? 0)
      .limit(3)
      .getIndexes()
  }

  onRuleStart(): AurealisMove[] {
    return this.buyMoves.length ? [] : [this.startRule(RuleId.ResolveEffects)]
  }

  getPlayerMoves(): AurealisMove[] {
    return this.buyMoves
  }

  get buyMoves(): AurealisMove[] {
    if (this.gold < this.cost) return []
    return this.candidates.map((card) =>
      this.material(MaterialType.JungleCard).index(card).moveItem({ type: LocationType.PlayerJungle, player: this.player })
    )
  }

  afterItemMove(move: AurealisItemMove): AurealisMove[] {
    if (isMoveItemType(MaterialType.JungleCard)(move) && move.location.type === LocationType.PlayerJungle) {
      return [...this.payGold(this.cost), this.startRule(RuleId.ResolveEffects)]
    }
    return super.afterItemMove(move)
  }
}
