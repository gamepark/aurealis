import { isCreateItemType, isCreateItemTypeAtOnce } from '@gamepark/rules-api'
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
 * They are placed one at a time, save for the one shortcut the display asks for: several pawns
 * filling the spaces of a single card at once, worth one pawn per space taken and offered wherever
 * more than one can go there (see {@link placeTogetherMoves}). It places nothing the single one
 * could not, several times over.
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
    return [...this.placeMoves, ...this.placeTogetherMoves]
  }

  get placeMoves(): AurealisMove[] {
    return this.jungleCardsWithFreeAnimalSpace.map((card) => this.material(MaterialType.AnimalPawn).createItem(this.animalPawn(card)))
  }

  /**
   * Filling several spaces of one card in one go: never more pawns than the effect has left, and
   * never more than the card has room for.
   *
   * Only offered where it is worth a button — two pawns or more — since a group of one is the single
   * move already on the table.
   */
  get placeTogetherMoves(): AurealisMove[] {
    return this.jungleCardsWithFreeAnimalSpace.flatMap((card) => {
      const count = Math.min(this.remaining, this.freeAnimalSpaces(card))
      if (count < 2) return []
      const pawns = Array.from({ length: count }, () => this.animalPawn(card))
      return [this.material(MaterialType.AnimalPawn).createItemsAtOnce(pawns)]
    })
  }

  private animalPawn(card: number) {
    return { location: { type: LocationType.JungleAnimalSpace, parent: card } }
  }

  afterItemMove(move: AurealisItemMove): AurealisMove[] {
    const consequences = super.afterItemMove(move)
    if (isCreateItemType(MaterialType.AnimalPawn)(move) && move.item.location.type === LocationType.JungleAnimalSpace) {
      return [...consequences, ...this.spendOne(this.jungleCardsWithFreeAnimalSpace.length > 0)]
    }
    // Pawns placed together cost one unit of the effect each.
    if (isCreateItemTypeAtOnce(MaterialType.AnimalPawn)(move) && move.items[0]?.location.type === LocationType.JungleAnimalSpace) {
      return [...consequences, ...this.spend(move.items.length, this.jungleCardsWithFreeAnimalSpace.length > 0)]
    }
    return consequences
  }
}
