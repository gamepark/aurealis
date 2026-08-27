import {
  DropAreaDescription,
  FlexLocator,
  getItemFromContext,
  HandLocator,
  ItemContext,
  ListLocator,
  Locator,
  MaterialContext,
  PileLocator
} from '@gamepark/react-game'
import { Location, MaterialItem, XYCoordinates } from '@gamepark/rules-api'
import { zoomOnHover } from './HoverZoom'
import {
  BASE_CAMP_ARCHAEOLOGISTS_OFFSET,
  PLAYER_BASE_CAMP,
  PLAYER_COINS,
  PLAYER_COINS_RADIUS,
  PLAYER_HAND,
  PLAYER_HAND_MAX_ANGLE,
  PLAYER_HAND_RADIUS,
  PLAYER_JUNGLE,
  PLAYER_JUNGLE_GAP,
  PLAYER_JUNGLE_SLOTS,
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
  gapMaxAngle = PLAYER_HAND_MAX_ANGLE / 4
  maxAngle = PLAYER_HAND_MAX_ANGLE

  getCoordinates(location: Location, context: MaterialContext) {
    return playerSide(PLAYER_HAND, location, context)
  }

  getBaseAngle(location: Location, context: MaterialContext) {
    return playerRotation(location, context)
  }

  /**
   * The shared zoom rather than the one {@link HandLocator} brings, which doubles a card wherever it
   * lies: the hand runs along the very edge of the table, so a card doubled in place would grow half
   * of itself off the bottom of the screen.
   */
  getHoverTransform(item: MaterialItem, context: ItemContext) {
    return zoomOnHover(this, item, context)
  }
}

class PlayerAreaLocator extends ListLocator {
  getCoordinates(location: Location, context: MaterialContext) {
    return playerSide(this.areaCoordinates, location, context)
  }

  /** Both areas hold cards, and both are along an edge of the table (see {@link zoomOnHover}). */
  getHoverTransform(item: MaterialItem, context: ItemContext) {
    return zoomOnHover(this, item, context)
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

/** The row of Jungle cards, growing away from the Camp de base. Never compressed: no card may hide another. */
class PlayerJungleLocator extends PlayerAreaLocator {
  areaCoordinates = PLAYER_JUNGLE
  areaGap = PLAYER_JUNGLE_GAP

  /**
   * The whole strip the row is given, rather than the box the cards already laid happen to fill.
   *
   * A Jungle card is bought into a player's row, and the row is one place: the card goes at its end
   * whichever spot of it was aimed at. So the target is the strip, {@link PLAYER_JUNGLE_SLOTS} cards
   * wide — and one card wider than the row itself once it has grown past that, since the strip must
   * always have room for the card being dropped.
   */
  private dropSlots(location: Location, context: MaterialContext) {
    return Math.max(PLAYER_JUNGLE_SLOTS, this.countItems(location, context) + 1)
  }

  /** The middle of that strip: the drop zone is drawn centred on wherever the location stands. */
  getAreaCoordinates(location: Location, context: MaterialContext) {
    const { x, y } = playerSide(PLAYER_JUNGLE, location, context)
    return { x: x + (PLAYER_JUNGLE_GAP.x * (this.dropSlots(location, context) - 1)) / 2, y }
  }

  generateLocationDescriptionFromDraggedItem(location: Location, context: ItemContext) {
    const { id } = getItemFromContext(context)
    const description = context.material[context.type]
    const { width = 0, height = 0 } = description?.getSize(id) ?? {}
    return new DropAreaDescription({
      width: width + PLAYER_JUNGLE_GAP.x * (this.dropSlots(location, context) - 1),
      height,
      borderRadius: description?.getBorderRadius(id) ?? 0
    })
  }
}

/** Far beyond any quantity a player can hold: see {@link PlayerCoinsLocator.getItemCoordinates}. */
const COINS_INDEX_SPREAD = 100

/**
 * A player's gold, scattered over the strip above their panel: one purse, the 3s and the 1s mixed.
 *
 * Money is one item per denomination carrying a quantity, and the framework draws one coin per unit
 * of that quantity. So the copies have to be spread out: laid on one spot, four 3s look exactly like
 * a single 3, and the table then states a number that is not the player's — 10 gold read as 4.
 *
 * Hence a scatter rather than a spot, over a strip far wider than tall ({@link PLAYER_COINS_RADIUS}),
 * and a minimum distance so that no coin can ever hide another whole: half a centimetre is more than
 * the 0.4 by which a 3 is wider than a 1, which is all it takes for the smaller one to keep an edge
 * showing. A scatter is not a count, and it is not meant to be one: it says "some gold, more than a
 * couple of pieces", and the exact amount is one hover away (see {@link MoneyDescription}).
 */
class PlayerCoinsLocator extends PileLocator {
  radius = PLAYER_COINS_RADIUS
  maxAngle = 90
  minimumDistance = 0.5

  getCoordinates(location: Location, context: MaterialContext) {
    return playerSide(PLAYER_COINS, location, context)
  }

  /**
   * The 3s and the 1s are one scatter, and a scatter tells its coins apart by `index + displayIndex`
   * — the item and which copy of its quantity. Two items of the same purse, whose indexes are next
   * to each other, would collide on that: the second 1 would be given the very spot of the first 3,
   * exactly under it. Hence the denomination pushing the indexes apart, far beyond any quantity a
   * player can hold — the box has 18 coins worth 1.
   */
  getItemCoordinates(item: MaterialItem, context: ItemContext) {
    return super.getItemCoordinates(item, { ...context, index: context.index + item.id * COINS_INDEX_SPREAD })
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

  getHoverTransform(item: MaterialItem, context: ItemContext) {
    return zoomOnHover(this, item, context)
  }
}

export const playerHandLocator = new PlayerHandLocator()
export const baseCampLocator = new BaseCampLocator()
export const baseCampArchaeologistsLocator = new BaseCampArchaeologistsLocator()
export const playerJungleLocator = new PlayerJungleLocator()
export const playerCoinsLocator = new PlayerCoinsLocator()
export const playerTilesLocator = new PlayerTilesLocator()
