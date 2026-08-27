import { AdventurerId, getBackMainType } from './Adventurer'
import { CardsInPlay, noCards, TypeCount } from './Condition'
import { LocationType } from './LocationType'
import { MaterialSource } from './MaterialSource'
import { MaterialType } from './MaterialType'

/**
 * The three places the conditions of an Adventurer card look at, counted the way a player counts
 * them at the table: off the card *backs*, which carry the main type and are visible everywhere —
 * on both stands and in the river — and only the main type ever counts (rulebook p.4).
 *
 * Asked here rather than in the rules alone, because a help dialog has to name the very line the
 * rules would apply: a card whose second line is met is played for its second line, and a dialog
 * that pointed at the first would be describing a different card from the one about to be played.
 */

const adventurers = (source: MaterialSource) => source.material(MaterialType.AdventurerCard)

/** The top of the Adventurer deck: the highest x of the pile, and the fifth back of the river. */
export const adventurerDeckTop = (source: MaterialSource) =>
  adventurers(source).location(LocationType.AdventurerDeck).maxBy((item) => item.location.x ?? 0)

/**
 * The Adventurer river: the 4 cards laid beside the deck *and* the top of the deck, which is the
 * fifth visible back (rulebook p.6). It is what a player draws from at the end of their turn, and
 * one of the three places the conditions of a card look at.
 */
export const adventurerRiver = (source: MaterialSource) =>
  adventurers(source).index([
    ...adventurers(source).location(LocationType.AdventurerRiver).getIndexes(),
    ...adventurerDeckTop(source).getIndexes()
  ])

export const adventurerHand = (source: MaterialSource, player: number) =>
  adventurers(source).location(LocationType.PlayerHand).player(player)

/** How many cards of each main type a set of cards holds. */
export const countTypes = (material: ReturnType<typeof adventurers>): TypeCount => {
  const counts = noCards()
  for (const item of material.getItems<AdventurerId>()) {
    counts[getBackMainType(item.id.back)]++
  }
  return counts
}

export const getCardsInPlay = (source: MaterialSource, player: number, opponent: number): CardsInPlay => ({
  hand: countTypes(adventurerHand(source, player)),
  opponent: countTypes(adventurerHand(source, opponent)),
  river: countTypes(adventurerRiver(source))
})
