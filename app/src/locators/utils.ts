import { getRelativePlayerIndex, MaterialContext } from '@gamepark/react-game'
import { Location, XYCoordinates } from '@gamepark/rules-api'
import { ARCHAEOLOGISTS_HEX_RADIUS } from './TableLayout'

/**
 * The flat-topped hexagon a team of Archaeologists standing on a card forms: the first pawn in the
 * middle, the 6 others on the ring around them, the first of those due right and the rest every
 * sixth of a turn from there. Flat-topped means the two vertices are the ones left and right, so the
 * team is wider than it is tall — the way round that suits a card standing upright.
 *
 * Given as an offset from the middle of the team, so that it serves the Camp de base and the middle
 * of a Jungle card alike: an Archaeologist is either on something printed, or standing with the
 * others in the middle of the card.
 */
export const archaeologistsHexagon = (index: number): XYCoordinates => {
  if (index <= 0) return { x: 0, y: 0 }
  const angle = ((index - 1) * Math.PI) / 3
  return { x: ARCHAEOLOGISTS_HEX_RADIUS * Math.cos(angle), y: ARCHAEOLOGISTS_HEX_RADIUS * Math.sin(angle) }
}

/** True for the player looking at the table, whose area is displayed at the bottom. */
export const isNearPlayer = (location: Location, context: MaterialContext) => getRelativePlayerIndex(context, location.player) === 0

/**
 * The far player's area is the near player's area reflected across the middle of the table: the same
 * from left to right, on the other side. Rows and lines are reflected the same way, which is why gaps
 * go through here too — the tiles a player wins pile up towards their own edge of the table.
 *
 * A reflection rather than a half turn, because nothing here is turned upside down: an item is read
 * the same way whoever owns it.
 */
export const playerSide = <T extends XYCoordinates>(coordinates: T, location: Location, context: MaterialContext): XYCoordinates =>
  isNearPlayer(location, context) ? coordinates : { x: coordinates.x, y: -coordinates.y }

/** Half a turn for the far player: their hand is face down and fans towards them. */
export const playerRotation = (location: Location, context: MaterialContext) => (isNearPlayer(location, context) ? 0 : 180)
