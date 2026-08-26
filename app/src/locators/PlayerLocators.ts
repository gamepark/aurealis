import { FlexLocator, HandLocator, ItemContext, ListLocator, Locator, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem, XYCoordinates } from '@gamepark/rules-api'
import {
  BASE_CAMP_ARCHAEOLOGISTS_OFFSET,
  PLAYER_BASE_CAMP,
  PLAYER_COINS,
  PLAYER_COINS_GAP,
  PLAYER_HAND,
  PLAYER_HAND_MAX_ANGLE,
  PLAYER_HAND_RADIUS,
  PLAYER_DRAWN_CARDS,
  PLAYER_DRAWN_CARDS_GAP,
  PLAYER_JUNGLE,
  PLAYER_JUNGLE_GAP,
  PLAYER_TILES,
  PLAYER_TILES_GAP,
  PLAYER_TILES_LINE_GAP,
  PLAYER_TILES_PER_LINE
} from './TableLayout'
import { archaeologistsHexagon, playerRotation, playerSide } from './utils'

/**
 * A player's own area, described once for the player facing the table: {@link playerSide} reflects it
 * onto the other side of the table for the opponent.
 */

/** The card stand: fronts for their owner, backs for the opponent, and no card hiding the next. */
class PlayerHandLocator extends HandLocator {
  radius = PLAYER_HAND_RADIUS
  maxAngle = PLAYER_HAND_MAX_ANGLE

  getCoordinates(location: Location, context: MaterialContext) {
    return playerSide(PLAYER_HAND, location, context)
  }

  getBaseAngle(location: Location, context: MaterialContext) {
    return playerRotation(location, context)
  }
}

class PlayerAreaLocator extends ListLocator {
  getCoordinates(location: Location, context: MaterialContext) {
    return playerSide(this.areaCoordinates, location, context)
  }

  getGap(location: Location, context: MaterialContext) {
    return playerSide(this.areaGap, location, context)
  }

  protected areaCoordinates: XYCoordinates = { x: 0, y: 0 }
  protected areaGap: XYCoordinates = { x: 0, y: 0 }
}

class BaseCampLocator extends PlayerAreaLocator {
  areaCoordinates = PLAYER_BASE_CAMP
}

/**
 * The team waiting on the Camp de base, as the hexagon of {@link archaeologistsHexagon}.
 *
 * The pawns keep the spot they were given: their location follows a {@link FillGapStrategy}, so
 * nobody closes ranks when one leaves, and a pawn coming back from the jungle takes an empty spot
 * rather than a new one.
 *
 * The ring is spread from the centre of the team, and that centre is an offset from the card which
 * is not reflected: the card is not either, so the team keeps its place on the illustration.
 */
class BaseCampArchaeologistsLocator extends Locator {
  getItemCoordinates(item: MaterialItem, context: ItemContext) {
    const { x, y } = playerSide(PLAYER_BASE_CAMP, item.location, context)
    const offset = archaeologistsHexagon(this.getItemIndex(item, context))
    return { x: x + BASE_CAMP_ARCHAEOLOGISTS_OFFSET.x + offset.x, y: y + BASE_CAMP_ARCHAEOLOGISTS_OFFSET.y + offset.y }
  }
}

/**
 * The cards being drawn, in a row above the stand. They are face down for both players, so nothing
 * here needs to be told apart — only counted, and put back in the same order they were taken.
 */
class PlayerDrawnCardsLocator extends PlayerAreaLocator {
  areaCoordinates = PLAYER_DRAWN_CARDS
  areaGap = PLAYER_DRAWN_CARDS_GAP
}

/** The row of Jungle cards, growing away from the Camp de base. Never compressed: no card may hide another. */
class PlayerJungleLocator extends PlayerAreaLocator {
  areaCoordinates = PLAYER_JUNGLE
  areaGap = PLAYER_JUNGLE_GAP
}

/** One item per denomination, the 3s before the 1s, whatever order they were gained in. */
class PlayerCoinsLocator extends PlayerAreaLocator {
  areaCoordinates = PLAYER_COINS
  areaGap = PLAYER_COINS_GAP

  getItemIndex(item: MaterialItem) {
    return item.id === 3 ? 0 : 1
  }
}

/** Discovery and Fame tiles won, 4 per line: the 7th ends the game. */
class PlayerTilesLocator extends FlexLocator {
  lineSize = PLAYER_TILES_PER_LINE
  gap = PLAYER_TILES_GAP

  getCoordinates(location: Location, context: MaterialContext) {
    return playerSide(PLAYER_TILES, location, context)
  }

  getLineGap(location: Location, context: MaterialContext) {
    return playerSide(PLAYER_TILES_LINE_GAP, location, context)
  }
}

export const playerHandLocator = new PlayerHandLocator()
export const baseCampLocator = new BaseCampLocator()
export const baseCampArchaeologistsLocator = new BaseCampArchaeologistsLocator()
export const playerDrawnCardsLocator = new PlayerDrawnCardsLocator()
export const playerJungleLocator = new PlayerJungleLocator()
export const playerCoinsLocator = new PlayerCoinsLocator()
export const playerTilesLocator = new PlayerTilesLocator()
