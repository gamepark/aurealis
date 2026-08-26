import { getRelativePlayerIndex, MaterialContext } from '@gamepark/react-game'
import { Location, XYCoordinates } from '@gamepark/rules-api'

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
