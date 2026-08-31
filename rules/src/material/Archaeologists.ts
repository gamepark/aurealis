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

/**
 * The Archaeologists of a card that a whole team may walk off it in one move: the ones gathered in
 * its middle, the last arrived first.
 *
 * The ones standing on its printed slots are left out, however many moves the player has left. A
 * pawn on a slot is building the Dig Site of the card, and taking it off gives that up (rulebook
 * p.7) — one of the few things in the game a player can undo their own work with, so it is a
 * decision taken one pawn at a time and never a button that takes several at once. The ones in the
 * middle only got there once the slots were full: they are building nothing, and walking them all
 * on costs the player nothing but the moves it is worth.
 */
export const archaeologistsLeavingTogether = (source: MaterialSource, card: number): number[] => lastFirst(extraArchaeologistsOn(source, card))

/**
 * The team of the Camp de base in the order it walks out: the highest `x` first, as on a card. The
 * pawns of the camp are one heap nothing else tells apart, and the state lists them in the order
 * they were created, which is no order at all once some of them have been away and come back.
 *
 * `x` is the spot each pawn holds in the hexagon the team is drawn as, and a spot left empty is
 * filled again by the next pawn coming home. Walking them out from the far end of that hexagon is
 * what keeps the camp emptying from its edge rather than out of its middle, and what makes the pawn
 * one press of a button takes the pawn the next press takes again.
 */
export const archaeologistsLeavingCamp = (source: MaterialSource, player: number): number[] => lastFirst(archaeologistsAtCamp(source, player))

/** The one Archaeologist a player is offered to send out of the camp: the first to leave it. */
export const lastArchaeologistAtCamp = (source: MaterialSource, player: number): number | undefined => archaeologistsLeavingCamp(source, player)[0]
