import {
  CompetitiveRank,
  FillGapStrategy,
  hideFront,
  hideFrontToOthers,
  MaterialGame,
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
      [LocationType.DrawnCards]: hideFront,
      [LocationType.PlayerHand]: hideFrontToOthers
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
      [LocationType.DrawnCards]: new PositiveSequenceStrategy(),
      [LocationType.PlayerHand]: new PositiveSequenceStrategy(),
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
    }
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
