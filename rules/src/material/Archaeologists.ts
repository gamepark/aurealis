import { LocationType } from './LocationType'
import { MaterialSource } from './MaterialSource'
import { MaterialType } from './MaterialType'

/** The team still waiting on a player's Camp de base. */
export const archaeologistsAtCamp = (source: MaterialSource, player: number) =>
  source.material(MaterialType.ArchaeologistPawn).location(LocationType.BaseCampArchaeologists).player(player)

/** The Archaeologists standing on the printed slots of the card: only they build a Dig Site. */
export const archaeologistsOnSlots = (source: MaterialSource, card: number) =>
  source.material(MaterialType.ArchaeologistPawn).location(LocationType.JungleArchaeologistSpace).parent(card)

/** The ones standing on the card outside its slots, gathered in the middle of it. */
export const extraArchaeologistsOn = (source: MaterialSource, card: number) =>
  source.material(MaterialType.ArchaeologistPawn).location(LocationType.JungleExtraArchaeologists).parent(card)

/** Every Archaeologist on the card, slots or not: they can all leave it again. */
export const archaeologistsOn = (source: MaterialSource, card: number): number[] => [
  ...archaeologistsOnSlots(source, card).getIndexes(),
  ...extraArchaeologistsOn(source, card).getIndexes()
]

/**
 * The one Archaeologist a player is offered to move off that card. Nobody ever asks for one pawn
 * rather than another — they are the same piece — so the interface never makes them choose: a card
 * carries one button, and it takes the last Archaeologist to have arrived there.
 *
 * Last is not arbitrary. The ones gathered in the middle of the card only got there once its slots
 * were full, so they are the ones whose leaving costs nothing: emptying a slot would undo the Dig
 * Site being built on it.
 */
export const lastArchaeologistOn = (source: MaterialSource, card: number): number | undefined => {
  const extra = extraArchaeologistsOn(source, card)
  const pawns = extra.length ? extra : archaeologistsOnSlots(source, card)
  return pawns.maxBy((pawn) => pawn.location.x ?? 0).getIndexes()[0]
}

/** Likewise at the Camp de base, where the team is one heap of pawns nothing tells apart. */
export const lastArchaeologistAtCamp = (source: MaterialSource, player: number): number | undefined =>
  archaeologistsAtCamp(source, player).getIndexes()[0]
