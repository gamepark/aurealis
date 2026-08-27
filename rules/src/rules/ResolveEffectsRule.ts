import { CustomMove, isCustomMoveType } from '@gamepark/rules-api'
import { Effect, EffectOf, EffectType } from '../material/Effect'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Memory } from '../Memory'
import { AurealisMove, AurealisRule } from './AurealisRule'
import { CustomMoveType } from './CustomMoveType'
import { RuleId } from './RuleId'

/** The rule that lets the player spend an effect, or nothing when the rules apply it on their own. */
const effectRule = (effect: Effect): RuleId | undefined => {
  switch (effect.type) {
    case EffectType.ArchaeologistMoves:
    case EffectType.MovesOrGold:
      return RuleId.MoveArchaeologists
    case EffectType.SendArchaeologists:
      return RuleId.SendArchaeologists
    case EffectType.PlaceAnimals:
      return RuleId.PlaceAnimals
    case EffectType.BuyJungle:
      return RuleId.AcquireJungle
    case EffectType.TempleTile:
      return RuleId.ChooseTempleTile
    default:
      return undefined
  }
}

/**
 * The queue of what the action still owes the player. Not a step of the rulebook: it is what "puis,
 * appliquez les effets" comes down to once an effect can take several moves and can, on the way,
 * unlock the bonuses of a Jungle card, which fall in behind it.
 *
 * One effect leaves the queue per pass. Either the rules can apply it themselves and the queue moves
 * straight on, or it opens the rule where the player spends it, which comes back here when done.
 * An empty queue is the end of the action.
 */
export class ResolveEffectsRule extends AurealisRule {
  onRuleStart(): AurealisMove[] {
    const pending = [...this.pendingEffects]
    const effect = pending.shift()
    this.memorize(Memory.PendingEffects, pending)
    if (!effect) return this.endOfAction()
    if (effect.type === EffectType.Choice) {
      // The one effect this rule resolves itself, since choosing takes no more than a click.
      if (!this.canApplyEffect(effect)) return [this.startRule(RuleId.ResolveEffects)]
      this.memorize(Memory.CurrentEffect, effect)
      return []
    }
    const rule = effectRule(effect)
    if (rule !== undefined) {
      this.memorize(Memory.CurrentEffect, effect)
      return [this.startRule(rule)]
    }
    return [...this.applyEffect(effect), this.startRule(RuleId.ResolveEffects)]
  }

  /**
   * Only ever asked when a slash on a card leaves the player one gain to pick out of two. A gain
   * that would give nothing is not one of them: buying a Jungle card is not offered to a player who
   * cannot pay for it, and the other side of the slash is then the only thing left to pick.
   */
  getPlayerMoves(): AurealisMove[] {
    const effect = this.currentEffect()
    if (effect?.type !== EffectType.Choice) return []
    return effect.options.flatMap((option, index) =>
      this.canApplyEffect(option) ? [this.customMove(CustomMoveType.ChooseEffect, index)] : []
    )
  }

  /** The gain picked jumps the queue: it is part of the effect that was being resolved. */
  onCustomMove(move: CustomMove): AurealisMove[] {
    if (!isCustomMoveType(CustomMoveType.ChooseEffect)(move)) return super.onCustomMove(move)
    const chosen = this.currentEffect<EffectOf<EffectType.Choice>>().options[move.data as number]
    this.memorize(Memory.PendingEffects, [chosen, ...this.pendingEffects])
    return [this.startRule(RuleId.ResolveEffects)]
  }

  /**
   * The effects that leave the player no choice. A supply that has run dry simply gives nothing:
   * the Relic tiles can run out, and a Legendary Animal tile the opponent already took is gone for
   * good — there is only one of each.
   */
  private applyEffect(effect: Effect): AurealisMove[] {
    const player = this.player
    switch (effect.type) {
      case EffectType.Gold:
        return [this.takeGold(effect.gold)]
      case EffectType.RelicTile:
        return this.material(MaterialType.RelicTile)
          .location(LocationType.Reserve)
          .limit(1)
          .moveItems({ type: LocationType.PlayerTiles, player })
      case EffectType.LegendaryAnimalTile:
        return this.material(MaterialType.LegendaryAnimalTile)
          .location(LocationType.Reserve)
          .id(effect.animal)
          .moveItems({ type: LocationType.PlayerTiles, player })
      case EffectType.AnimalOnEachJungle:
        return this.jungleCardsWithFreeAnimalSpace.map((card) =>
          this.material(MaterialType.AnimalPawn).createItem({ location: { type: LocationType.JungleAnimalSpace, parent: card } })
        )
      default:
        return []
    }
  }
}
