import { Location } from '@gamepark/rules-api'
import { archaeologistsOnSlots } from './Archaeologists'
import { EffectType } from './Effect'
import { getAnimalSpaces, getArchaeologistSpaces, getJungleBonuses, Jungle } from './Jungle'
import { LocationType } from './LocationType'
import { MaterialSource } from './MaterialSource'
import { MaterialType } from './MaterialType'

/**
 * How far a Jungle card is from giving up what it holds: whether each of its two bonus spaces has
 * been taken, and how much room is left on it for pawns.
 *
 * Asked here rather than in {@link AurealisRule} alone, for the reason {@link MaterialSource} gives:
 * the rules are not the only ones who put those questions. An automatic player weighing a card it
 * might buy, or a pawn it might send, has to read a card exactly as the rules read it — a card it
 * thought still had a free slot is a plan the rules would refuse.
 */

/** A player's row of Jungle cards, growing rightwards from the Camp de base. */
export const playerJungleCards = (source: MaterialSource, player: number) =>
  source.material(MaterialType.JungleCard).location(LocationType.PlayerJungle).player(player)

/** A card turned onto its completed face has no space left on it: nothing can be put there again. */
export const isCompletedJungle = (card: { location: Location<number, LocationType> }): boolean => !!card.location.rotation

/** The Bonus Fouilles of the card taken: its Dig Site has been built, and never will be again. */
export const hasDigSite = (source: MaterialSource, card: number): boolean =>
  source.material(MaterialType.DigSitePawn).location(LocationType.JungleDigSiteBonus).parent(card).length > 0

/**
 * The pawn sitting on the Bonus Animal space is the record that the bonus was obtained
 * (rulebook p.5): the spaces of the card are then emptied for good, and nothing goes back on them.
 */
export const hasAnimalBonus = (source: MaterialSource, card: number): boolean =>
  source.material(MaterialType.AnimalPawn).location(LocationType.JungleAnimalBonus).parent(card).length > 0

export const animalPawnsOn = (source: MaterialSource, card: number) =>
  source.material(MaterialType.AnimalPawn).location(LocationType.JungleAnimalSpace).parent(card)

export const freeAnimalSpaces = (source: MaterialSource, card: number): number => {
  const item = source.material(MaterialType.JungleCard).getItem<Jungle>(card)
  if (isCompletedJungle(item) || hasAnimalBonus(source, card)) return 0
  return getAnimalSpaces(item.id) - animalPawnsOn(source, card).length
}

/**
 * How many printed slots of the card are still worth standing on. Filling them is the one thing
 * they are for — a Dig Site is built by taking them all (rulebook p.7) — so a card that can no
 * longer be dug counts none of them, whether or not it still has one drawn on it.
 */
export const freeArchaeologistSlots = (source: MaterialSource, card: number): number => {
  const item = source.material(MaterialType.JungleCard).getItem<Jungle>(card)
  if (isCompletedJungle(item) || hasDigSite(source, card)) return 0
  return getArchaeologistSpaces(item.id) - archaeologistsOnSlots(source, card).length
}

/**
 * The 5 Jungle cards whose Bonus Exploration is a Temple tile — the only place a Temple tile ever
 * comes from, which is what makes them the cards the whole game is played for: a third Temple tile
 * wins on the spot (rulebook p.11).
 */
export const givesTempleTile = (jungle: Jungle): boolean =>
  getJungleBonuses(jungle).exploration.some((effect) => effect.type === EffectType.TempleTile)
