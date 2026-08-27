import {
  CompetitiveRank,
  FillGapStrategy,
  hideFront,
  hideFrontToOthers,
  HidingSecretsStrategy,
  Material,
  MaterialGame,
  MaterialItem,
  MaterialMove,
  PositiveSequenceStrategy,
  SecretMaterialRules,
  TimeLimit
} from '@gamepark/rules-api'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { Memory } from './Memory'
import { AcquireJungleRule } from './rules/AcquireJungleRule'
import { BaseCampDiscardRule } from './rules/BaseCampDiscardRule'
import { CheckFameRule } from './rules/CheckFameRule'
import { ChooseActionRule } from './rules/ChooseActionRule'
import { ChooseTempleTileRule } from './rules/ChooseTempleTileRule'
import { MoveArchaeologistsRule } from './rules/MoveArchaeologistsRule'
import { PlaceAnimalsRule } from './rules/PlaceAnimalsRule'
import { RefillHandRule } from './rules/RefillHandRule'
import { ResolveEffectsRule } from './rules/ResolveEffectsRule'
import { RuleId } from './rules/RuleId'
import { SendArchaeologistsRule } from './rules/SendArchaeologistsRule'

/**
 * A card on a stand is hidden from everyone but the player holding it — unless it is rotated, and
 * then from that player too.
 *
 * A rotated card on a stand is one just drawn and not yet turned over: "sélectionnez vos cartes d'un
 * seul coup, sans les remplacer ni regarder leurs effets" (rulebook p.11). A card picked among the 5
 * backs of the river must stay unread while the next one is being chosen, and it is picked into the
 * hand straight away — so the hand is where it waits, face down, until they all turn over together
 * (see {@link RefillHandRule}).
 */
const hideHandCard: HidingSecretsStrategy<number, LocationType> = (item: MaterialItem<number, LocationType>, player?: number) =>
  item.location.rotation ? hideFront(item) : hideFrontToOthers(item, player)

/**
 * The stand, ordered as any sequence is, but where a card that moves without being given a place
 * keeps the one it had.
 *
 * The only such move is the cards drawn face down turning over at the end of the turn (see
 * {@link RefillHandRule.endOfTurn}): they are one move carrying no `x`, and a plain sequence reads
 * that as "send it to the end of the row" — three cards each sent to the end in turn come back in
 * the order the items array happens to hold them, not the order they are standing in. The hand of
 * the player whose turn it is would then reshuffle itself under their eyes for no reason at all.
 *
 * A place asked for is still honoured, and a card leaving still closes the gap behind it: only the
 * "no place given" case changes, from "go to the end" to "stay where you are".
 */
class HandSequenceStrategy extends PositiveSequenceStrategy<number, MaterialType, LocationType> {
  moveItem(material: Material<number, MaterialType, LocationType>, item: MaterialItem<number, LocationType>, index: number) {
    if (item.location[this.axis] === undefined) {
      item.location[this.axis] = material.getItem(index).location[this.axis]
      return
    }
    super.moveItem(material, item, index)
  }
}

/**
 * This class implements the rules of the board game.
 * It must follow Game Park "Rules" API so that the Game Park server can enforce the rules.
 *
 * Secret rather than merely hidden information: a player sees the front of the cards on their own
 * stand, and their opponent does not, so the two of them hold different information.
 */
export class AurealisRules
  extends SecretMaterialRules<number, MaterialType, LocationType>
  implements CompetitiveRank<MaterialGame<number, MaterialType, LocationType>, MaterialMove<number, MaterialType, LocationType>, number>,
    TimeLimit<MaterialGame<number, MaterialType, LocationType>, MaterialMove<number, MaterialType, LocationType>> {
  rules = {
    [RuleId.ChooseAction]: ChooseActionRule,
    [RuleId.BaseCampDiscard]: BaseCampDiscardRule,
    [RuleId.ResolveEffects]: ResolveEffectsRule,
    [RuleId.MoveArchaeologists]: MoveArchaeologistsRule,
    [RuleId.SendArchaeologists]: SendArchaeologistsRule,
    [RuleId.PlaceAnimals]: PlaceAnimalsRule,
    [RuleId.AcquireJungle]: AcquireJungleRule,
    [RuleId.ChooseTempleTile]: ChooseTempleTileRule,
    [RuleId.CheckFame]: CheckFameRule,
    [RuleId.RefillHand]: RefillHandRule
  }

  /**
   * Only `id.front` is ever stripped, never the whole id: the back of an Adventurer card is public
   * information everywhere it can be seen. It carries the card's main and secondary types, which the
   * opponent is meant to read off the stand and off the river to plan against.
   *
   * Jungle and Camp de base cards are absent on purpose: nothing about them is hidden. The Jungle
   * deck is built face up, and a card's verso is its completed face, not a concealed back.
   */
  hidingStrategies = {
    [MaterialType.AdventurerCard]: {
      [LocationType.AdventurerDeck]: hideFront,
      [LocationType.AdventurerRiver]: hideFront,
      [LocationType.PlayerHand]: hideHandCard
    }
  }

  /**
   * Every pile and every row where items simply follow one another keeps a `x` sequence: it is what
   * orders a deck (the top card is the highest `x`), and what the display needs to tell two items of
   * the same location apart instead of stacking them all at its first spot.
   *
   * The river and the market are the other case: their slots are fixed, so a card taken leaves its
   * slot empty until the next one comes and fills the gap.
   */
  locationsStrategies = {
    [MaterialType.AdventurerCard]: {
      [LocationType.AdventurerDeck]: new PositiveSequenceStrategy(),
      [LocationType.AdventurerDiscard]: new PositiveSequenceStrategy(),
      [LocationType.PlayerHand]: new HandSequenceStrategy(),
      [LocationType.AdventurerRiver]: new FillGapStrategy()
    },
    [MaterialType.JungleCard]: {
      [LocationType.JungleDeck]: new PositiveSequenceStrategy(),
      [LocationType.PlayerJungle]: new PositiveSequenceStrategy(),
      [LocationType.JungleMarket]: new FillGapStrategy()
    },
    [MaterialType.ArchaeologistPawn]: {
      [LocationType.BaseCampArchaeologists]: new FillGapStrategy(),
      [LocationType.JungleArchaeologistSpace]: new PositiveSequenceStrategy(),
      [LocationType.JungleExtraArchaeologists]: new FillGapStrategy()
    },
    [MaterialType.AnimalPawn]: {
      [LocationType.JungleAnimalSpace]: new PositiveSequenceStrategy()
    },
    [MaterialType.Tile]: {
      [LocationType.Reserve]: new PositiveSequenceStrategy(),
      [LocationType.PlayerTiles]: new PositiveSequenceStrategy()
    }
  }

  /**
   * The 9 Relic tiles are identical to one another, and identical items landing on the same spot
   * merge into a single item with a quantity — which is right for gold, and wrong for a tile: a row
   * of tiles gives each of them a place of its own, and a quantity has only one.
   *
   * The two rows the tiles live in are ordered sequences, so what they need is one item per tile,
   * each with its own `x`. The Relic pile of the supply reads just as well that way: nine items one
   * behind the other rather than one item nine thick.
   */
  itemsCanMerge(type: MaterialType): boolean {
    return type !== MaterialType.Tile
  }

  /**
   * There is one winner and no score: the game stops the moment someone has 7 tiles at the start of
   * their turn, or reaches their third Temple tile. The rule that ended it is gone by the time the
   * players are ranked, hence the memory.
   */
  rankPlayers(playerA: number, playerB: number): number {
    const winner = this.remind<number>(Memory.Winner)
    if (playerA === winner) return -1
    if (playerB === winner) return 1
    return 0
  }

  giveTime(): number {
    return 60
  }
}
