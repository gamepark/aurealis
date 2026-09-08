import { AdventurerType } from '@gamepark/aurealis/material/AdventurerType'
import { Condition, ConditionType, Elsewhere } from '@gamepark/aurealis/material/Condition'
import { Effect, EffectType } from '@gamepark/aurealis/material/Effect'
import { LegendaryAnimal } from '@gamepark/aurealis/material/LegendaryAnimal'
import archaeologist from '../../images/icons/Archaeologist.png'
import expeditionLeader from '../../images/icons/ExpeditionLeader.png'
import explorer from '../../images/icons/Explorer.png'
import naturalist from '../../images/icons/Naturalist.png'
import allTypes from '../../images/icons/conditions/AllTypes.png'
import and from '../../images/icons/conditions/And.png'
import fewerArchaeologist from '../../images/icons/conditions/FewerArchaeologist.png'
import fewerExpeditionLeader from '../../images/icons/conditions/FewerExpeditionLeader.png'
import fewerExplorer from '../../images/icons/conditions/FewerExplorer.png'
import fewerNaturalist from '../../images/icons/conditions/FewerNaturalist.png'
import inPlayArchaeologist from '../../images/icons/conditions/InPlayArchaeologist.png'
import inPlayExpeditionLeader from '../../images/icons/conditions/InPlayExpeditionLeader.png'
import inPlayExplorer from '../../images/icons/conditions/InPlayExplorer.png'
import inPlayNaturalist from '../../images/icons/conditions/InPlayNaturalist.png'
import min2Archaeologist from '../../images/icons/conditions/Min2Archaeologist.png'
import min2ExpeditionLeader from '../../images/icons/conditions/Min2ExpeditionLeader.png'
import min2Explorer from '../../images/icons/conditions/Min2Explorer.png'
import min2Naturalist from '../../images/icons/conditions/Min2Naturalist.png'
import min3Archaeologist from '../../images/icons/conditions/Min3Archaeologist.png'
import min3ExpeditionLeader from '../../images/icons/conditions/Min3ExpeditionLeader.png'
import min3Explorer from '../../images/icons/conditions/Min3Explorer.png'
import min3Naturalist from '../../images/icons/conditions/Min3Naturalist.png'
import moreArchaeologist from '../../images/icons/conditions/MoreArchaeologist.png'
import moreExpeditionLeader from '../../images/icons/conditions/MoreExpeditionLeader.png'
import moreExplorer from '../../images/icons/conditions/MoreExplorer.png'
import moreNaturalist from '../../images/icons/conditions/MoreNaturalist.png'
import noArchaeologist from '../../images/icons/conditions/NoArchaeologist.png'
import noExpeditionLeader from '../../images/icons/conditions/NoExpeditionLeader.png'
import noExplorer from '../../images/icons/conditions/NoExplorer.png'
import noNaturalist from '../../images/icons/conditions/NoNaturalist.png'
import or from '../../images/icons/conditions/Or.png'
import animal from '../../images/icons/effects/Animal.png'
import animal1 from '../../images/icons/effects/Animal1.png'
import animal2 from '../../images/icons/effects/Animal2.png'
import animal3 from '../../images/icons/effects/Animal3.png'
import animal4 from '../../images/icons/effects/Animal4.png'
import animalOnEachJungle from '../../images/icons/effects/AnimalOnEachJungle.png'
import gold from '../../images/icons/effects/Gold.png'
import gold2 from '../../images/icons/effects/Gold2.png'
import gold3 from '../../images/icons/effects/Gold3.png'
import gold4 from '../../images/icons/effects/Gold4.png'
import gold5 from '../../images/icons/effects/Gold5.png'
import gold6 from '../../images/icons/effects/Gold6.png'
import gold7 from '../../images/icons/effects/Gold7.png'
import jungle from '../../images/icons/effects/Jungle.png'
import jungle1 from '../../images/icons/effects/Jungle1.png'
import jungle2 from '../../images/icons/effects/Jungle2.png'
import jungle3 from '../../images/icons/effects/Jungle3.png'
import jungle4 from '../../images/icons/effects/Jungle4.png'
import jungle5 from '../../images/icons/effects/Jungle5.png'
import jungle6 from '../../images/icons/effects/Jungle6.png'
import move from '../../images/icons/effects/Move.png'
import move2 from '../../images/icons/effects/Move2.png'
import move3 from '../../images/icons/effects/Move3.png'
import move4 from '../../images/icons/effects/Move4.png'
import move5 from '../../images/icons/effects/Move5.png'
import move6 from '../../images/icons/effects/Move6.png'
import move7 from '../../images/icons/effects/Move7.png'
import moveOrGold from '../../images/icons/effects/MoveOrGold.png'
import moveOrGold4 from '../../images/icons/effects/MoveOrGold4.png'
import moveOrGold5 from '../../images/icons/effects/MoveOrGold5.png'
import moveOrGold6 from '../../images/icons/effects/MoveOrGold6.png'
import moveOrGold9 from '../../images/icons/effects/MoveOrGold9.png'
import relicTile from '../../images/icons/effects/RelicTile.png'
import sendArchaeologists from '../../images/icons/effects/SendArchaeologists.png'
import templeTile from '../../images/icons/effects/TempleTile.png'
import legendaryAnimal1 from '../../images/tiles/LegendaryAnimal1.jpg'
import legendaryAnimal2 from '../../images/tiles/LegendaryAnimal2.jpg'
import legendaryAnimal3 from '../../images/tiles/LegendaryAnimal3.jpg'
import legendaryAnimal4 from '../../images/tiles/LegendaryAnimal4.jpg'
import legendaryAnimal5 from '../../images/tiles/LegendaryAnimal5.jpg'
import legendaryAnimal6 from '../../images/tiles/LegendaryAnimal6.jpg'
import legendaryAnimal7 from '../../images/tiles/LegendaryAnimal7.jpg'
import legendaryAnimal8 from '../../images/tiles/LegendaryAnimal8.jpg'
import legendaryAnimal9 from '../../images/tiles/LegendaryAnimal9.jpg'

/**
 * The icons of the box, matched to the conditions and the gains they stand for.
 *
 * The rulebook explains itself by setting each icon beside the sentence that reads it out (p.12),
 * and the help dialogs do the same: a player who has just read a line of a card here goes back to
 * the card, and what carries them across is the drawing, not the words.
 *
 * The files are the box's own artwork, cut apart one icon per file. A few of them arrive as a single
 * drawing holding several icons at once — "at least 2" and "at least 3" of a type are printed one
 * above the other, and the arrows that say "the opponent's stand *or* the river" sit beside the type
 * they qualify — so those are cut up too, and set back side by side here.
 */

const byType = (
  naturalistIcon: string,
  archaeologistIcon: string,
  explorerIcon: string,
  expeditionLeaderIcon: string
): Record<AdventurerType, string> => ({
  [AdventurerType.Naturalist]: naturalistIcon,
  [AdventurerType.Archaeologist]: archaeologistIcon,
  [AdventurerType.Explorer]: explorerIcon,
  [AdventurerType.ExpeditionLeader]: expeditionLeaderIcon
})

/** The 4 diamonds of the rulebook, one per kind of Adventurer (p.4). */
const typeIcons = byType(naturalist, archaeologist, explorer, expeditionLeader)

const noCardIcons = byType(noNaturalist, noArchaeologist, noExplorer, noExpeditionLeader)
const min2Icons = byType(min2Naturalist, min2Archaeologist, min2Explorer, min2ExpeditionLeader)
const min3Icons = byType(min3Naturalist, min3Archaeologist, min3Explorer, min3ExpeditionLeader)
const moreIcons = byType(moreNaturalist, moreArchaeologist, moreExplorer, moreExpeditionLeader)
const fewerIcons = byType(fewerNaturalist, fewerArchaeologist, fewerExplorer, fewerExpeditionLeader)

/**
 * "Cards of that type in play", the three games counted together. The box draws it with the "?" of
 * the cards that scale on three of the four types, and without it on the Naturalist — which is the
 * only type the cards ever put a fixed threshold on ({@link ConditionType.MinInPlay}).
 */
const inPlayIcons = byType(inPlayNaturalist, inPlayArchaeologist, inPlayExplorer, inPlayExpeditionLeader)

/** The two counts the cards ever ask for on a player's own stand. */
const minInHandIcons: Record<number, Record<AdventurerType, string>> = { 2: min2Icons, 3: min3Icons }

/** One arrow is "the opponent's stand or the river", two arrows is "both of them". */
const elsewhereIcon = (where: Elsewhere): string => (where === Elsewhere.OpponentAndRiver ? and : or)

/**
 * The drawing a line of an Adventurer card puts before its condition — one icon, or the type and the
 * arrows that qualify it, which the card prints side by side as well.
 */
export const getConditionIcons = (condition: Condition): string[] => {
  switch (condition.type) {
    case ConditionType.AllTypesInHand:
      return [allTypes]
    case ConditionType.NoneInHand:
      return [noCardIcons[condition.adventurer]]
    case ConditionType.MinInHand:
      // The cards only ever ask for 2 or 3; anything else has no drawing of its own to show.
      return minInHandIcons[condition.count] ? [minInHandIcons[condition.count][condition.adventurer]] : []
    case ConditionType.MinInPlay:
    case ConditionType.CardsInPlay:
      return [inPlayIcons[condition.adventurer]]
    case ConditionType.MinElsewhere:
      return [typeIcons[condition.adventurer], elsewhereIcon(condition.where)]
    case ConditionType.MoreThan:
      return [moreIcons[condition.adventurer], elsewhereIcon(condition.where)]
    case ConditionType.FewerThan:
      return [fewerIcons[condition.adventurer], elsewhereIcon(condition.where)]
  }
}

/**
 * The numbered icons, by what they are worth. The box prints the ones its cards and its tiles need
 * and no others, so a gain that falls outside — anything a card computes from the cards in play —
 * comes back to the plain icon of its family, which is the same drawing without its number.
 */
const goldIcons: Record<number, string> = { 1: gold, 2: gold2, 3: gold3, 4: gold4, 5: gold5, 6: gold6, 7: gold7 }
const moveIcons: Record<number, string> = { 1: move, 2: move2, 3: move3, 4: move4, 5: move5, 6: move6, 7: move7 }
const moveOrGoldIcons: Record<number, string> = { 1: moveOrGold, 4: moveOrGold4, 5: moveOrGold5, 6: moveOrGold6, 9: moveOrGold9 }
const animalIcons: Record<number, string> = { 1: animal1, 2: animal2, 3: animal3, 4: animal4 }
/** A Jungle card at 0 is the card on its own: taken rather than bought. */
const jungleIcons: Record<number, string> = { 0: jungle, 1: jungle1, 2: jungle2, 3: jungle3, 4: jungle4, 5: jungle5, 6: jungle6 }

/** The tile itself: a Legendary Animal is told from the next only by the animal painted on it. */
const legendaryAnimalIcons: Record<LegendaryAnimal, string> = {
  [LegendaryAnimal.LegendaryAnimal1]: legendaryAnimal1,
  [LegendaryAnimal.LegendaryAnimal2]: legendaryAnimal2,
  [LegendaryAnimal.LegendaryAnimal3]: legendaryAnimal3,
  [LegendaryAnimal.LegendaryAnimal4]: legendaryAnimal4,
  [LegendaryAnimal.LegendaryAnimal5]: legendaryAnimal5,
  [LegendaryAnimal.LegendaryAnimal6]: legendaryAnimal6,
  [LegendaryAnimal.LegendaryAnimal7]: legendaryAnimal7,
  [LegendaryAnimal.LegendaryAnimal8]: legendaryAnimal8,
  [LegendaryAnimal.LegendaryAnimal9]: legendaryAnimal9
}

/**
 * The drawing of a gain. A slash on a card is two gains and two icons, which is how the card sets
 * them out — the choice is between the drawings as much as between the sentences.
 */
export const getEffectIcons = (effect: Effect): string[] => {
  switch (effect.type) {
    case EffectType.Gold:
      return [goldIcons[effect.gold] ?? gold]
    case EffectType.ArchaeologistMoves:
      return [moveIcons[effect.count] ?? move]
    case EffectType.MovesOrGold:
      return [moveOrGoldIcons[effect.count] ?? moveOrGold]
    case EffectType.SendArchaeologists:
      // The box draws the pawn and its curved arrow, and never numbers it: the count is in the words.
      return [sendArchaeologists]
    case EffectType.PlaceAnimals:
      return [animalIcons[effect.count] ?? animal]
    case EffectType.AnimalOnEachJungle:
      return [animalOnEachJungle]
    case EffectType.BuyJungle:
      return [jungleIcons[effect.cost] ?? jungle]
    case EffectType.RelicTile:
      return [relicTile]
    case EffectType.TempleTile:
      return [templeTile]
    case EffectType.LegendaryAnimalTile:
      return [legendaryAnimalIcons[effect.animal]]
    case EffectType.Choice:
      return effect.options.flatMap(getEffectIcons)
    // Printed on no card, so drawn nowhere: a bonus waiting its turn in the queue, and the Camp de
    // base turning over.
    case EffectType.JungleDue:
    case EffectType.FlipBaseCamp:
      return []
  }
}
