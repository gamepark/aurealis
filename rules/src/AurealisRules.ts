import {
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
import { RuleId } from './rules/RuleId'
import { TheFirstStepRule } from './rules/TheFirstStepRule'

/**
 * This class implements the rules of the board game.
 * It must follow Game Park "Rules" API so that the Game Park server can enforce the rules.
 *
 * Secret rather than merely hidden information: a player sees the front of the cards on their own
 * stand, and their opponent does not, so the two of them hold different information.
 */
export class AurealisRules
  extends SecretMaterialRules<number, MaterialType, LocationType>
  implements TimeLimit<MaterialGame<number, MaterialType, LocationType>, MaterialMove<number, MaterialType, LocationType>, number> {
  rules = {
    [RuleId.TheFirstStep]: TheFirstStepRule
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
      [LocationType.PlayerHand]: new PositiveSequenceStrategy(),
      [LocationType.AdventurerRiver]: new FillGapStrategy()
    },
    [MaterialType.JungleCard]: {
      [LocationType.JungleDeck]: new PositiveSequenceStrategy(),
      [LocationType.PlayerJungle]: new PositiveSequenceStrategy(),
      [LocationType.JungleMarket]: new FillGapStrategy()
    },
    [MaterialType.ArchaeologistPawn]: {
      [LocationType.BaseCampArchaeologists]: new FillGapStrategy()
    }
  }

  giveTime(): number {
    return 60
  }
}
