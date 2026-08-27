import { isMoveItemType } from '@gamepark/rules-api'
import { Effect, EffectType } from '../material/Effect'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { getTempleEffects, isTemple, Temple } from '../material/Temple'
import { Tile } from '../material/Tile'
import { Memory } from '../Memory'
import { AurealisItemMove, AurealisMove, AurealisRule } from './AurealisRule'
import { RuleId } from './RuleId'

/** A player never holds a third Temple tile: it is the Instant Victory tile instead (rulebook p.11). */
const TEMPLES_BEFORE_VICTORY = 2

/**
 * Choosing one of the Temple tiles on display, and applying its effect at once (rulebook p.12).
 *
 * "Si vous ne pouvez pas réaliser l'effet inscrit sur la tuile, et qu'il n'y a plus d'autres tuiles
 * Temple disponibles, perdez l'effet mais gagnez la tuile": a tile whose effect would do nothing is
 * only offered when no other one is left. The effect is queued all the same — every rule it can open
 * hands straight back when there is nothing to do with it.
 */
export class ChooseTempleTileRule extends AurealisRule {
  onRuleStart(): AurealisMove[] {
    if (this.material(MaterialType.Tile).location(LocationType.PlayerTiles).player(this.player).id(isTemple).length >= TEMPLES_BEFORE_VICTORY) {
      this.memorize(Memory.Winner, this.player)
      return [
        ...this.material(MaterialType.Tile)
          .location(LocationType.Reserve)
          .id(Tile.InstantVictory)
          .moveItems({ type: LocationType.PlayerTiles, player: this.player }),
        this.endGame()
      ]
    }
    return this.templesOnDisplay.length ? [] : [this.startRule(RuleId.ResolveEffects)]
  }

  get templesOnDisplay(): number[] {
    return this.material(MaterialType.Tile).location(LocationType.TempleTilesRow).getIndexes()
  }

  getPlayerMoves(): AurealisMove[] {
    const usable = this.templesOnDisplay.filter((tile) => this.canApply(getTempleEffects(this.templeId(tile))))
    return (usable.length ? usable : this.templesOnDisplay).map((tile) =>
      this.material(MaterialType.Tile).index(tile).moveItem({ type: LocationType.PlayerTiles, player: this.player })
    )
  }

  private templeId(tile: number): Temple {
    return this.material(MaterialType.Tile).getItem<Temple>(tile).id
  }

  /**
   * Whether the player could do anything at all with what the tile gives. Buying a Jungle card is
   * judged the same way here as anywhere else, so the two never part ways.
   */
  private canApply(effects: Effect[]): boolean {
    return effects.some((effect) => {
      switch (effect.type) {
        case EffectType.PlaceAnimals:
          return this.jungleCardsWithFreeAnimalSpace.length > 0
        case EffectType.SendArchaeologists:
          return this.canSendArchaeologist
        default:
          return this.canApplyEffect(effect)
      }
    })
  }

  /** A pawn at the camp and a card to send it to, or two cards to send a pawn between. */
  private get canSendArchaeologist(): boolean {
    const cards = this.jungleCards().getIndexes()
    if (!cards.length) return false
    if (this.material(MaterialType.ArchaeologistPawn).location(LocationType.BaseCampArchaeologists).player(this.player).length > 0) return true
    return cards.length > 1 && cards.some((card) => this.archaeologistsOn(card).length > 0)
  }

  afterItemMove(move: AurealisItemMove): AurealisMove[] {
    if (isMoveItemType(MaterialType.Tile)(move) && move.location.type === LocationType.PlayerTiles && move.location.player === this.player) {
      const tile = this.material(MaterialType.Tile).getItem<Tile>(move.itemIndex).id
      if (!isTemple(tile)) return super.afterItemMove(move)
      this.pushEffects(getTempleEffects(tile))
      return [this.startRule(RuleId.ResolveEffects)]
    }
    return super.afterItemMove(move)
  }
}
