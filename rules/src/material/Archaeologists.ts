import { Material } from '@gamepark/rules-api'
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

/** The pawns of one group, the last arrived first: `x` is the order they were laid down in. */
const lastFirst = (pawns: Material<number, MaterialType, LocationType>): number[] => pawns.sort((pawn) => -(pawn.location.x ?? 0)).getIndexes()

/**
 * The Archaeologists of a card in the order they are taken off it: the ones gathered in the middle
 * of it first, and inside either group the last to have arrived first.
 *
 * Nobody ever asks for one pawn rather than another — they are the same piece — so the interface
 * never makes them choose: it walks them off the card in this order, one of them for a single move
 * and as many as are asked for when a whole group leaves together.
 *
 * The order is not arbitrary. The ones gathered in the middle only got there once the slots of the
 * card were full, so they are the ones whose leaving costs nothing: emptying a slot would undo the
 * Dig Site being built on it.
 */
export const archaeologistsLeavingOrder = (source: MaterialSource, card: number): number[] => [
  ...lastFirst(extraArchaeologistsOn(source, card)),
  ...lastFirst(archaeologistsOnSlots(source, card))
]

/** The one Archaeologist a player is offered to move off that card: the first to leave it. */
export const lastArchaeologistOn = (source: MaterialSource, card: number): number | undefined => archaeologistsLeavingOrder(source, card)[0]

/** Likewise at the Camp de base, where the team is one heap of pawns nothing tells apart. */
export const lastArchaeologistAtCamp = (source: MaterialSource, player: number): number | undefined =>
  archaeologistsAtCamp(source, player).getIndexes()[0]
