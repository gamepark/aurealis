import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { DelegateLocator, FlexLocator, isItemContext, ItemContext, ListLocator, Locator, MaterialContext, PileLocator } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { StackLocator, zoomOnHover } from './HoverZoom'
import {
  ANIMAL_PAWNS,
  DIG_SITE_PAWNS,
  DIG_SITE_PAWNS_GAP,
  INSTANT_VICTORY_TILE,
  LEGENDARY_ANIMAL_TILES,
  LEGENDARY_ANIMAL_TILES_GAP,
  LEGENDARY_ANIMAL_TILES_LINE_GAP,
  LEGENDARY_ANIMAL_TILES_PER_LINE,
  RELIC_DECK,
  RESERVE_COINS
} from './TableLayout'

/**
 * The general supply is a single location for every kind of component, so what the pieces look like
 * there comes from the type of the item being placed: a deck of Relic tiles, a grid of Legendary
 * Animal tiles, a row of pawns, two heaps beside it. Each delegate places only the type it is given,
 * which is what keeps the 40-odd pieces of the supply from being laid out as one stock.
 */
class ReserveLocator extends DelegateLocator<number, MaterialType, LocationType> {
  getDelegate(context: MaterialContext<number, MaterialType, LocationType>) {
    return (isItemContext(context) && reserveLocators[context.type]) || instantVictoryLocator
  }

  getPositionDependencies(location: Location, context: MaterialContext<number, MaterialType, LocationType>) {
    return this.getDelegate(context).getPositionDependencies(location, context)
  }

  /** Tiles grow under the pointer, gold and pawns do not: what a delegate says goes here too. */
  getHoverTransform(item: MaterialItem<number, LocationType>, context: ItemContext<number, MaterialType, LocationType>) {
    return this.getDelegate(context).getHoverTransform(item, context)
  }
}

/** The 9 Relic tiles are identical, hence one item with a quantity of 9, drawn as a stack of 9. */
const relicDeckLocator = new StackLocator({ coordinates: RELIC_DECK })

/** The 9 Legendary Animal tiles all differ, and none ever comes back: each keeps its own square. */
class LegendaryAnimalTilesLocator extends FlexLocator {
  coordinates = LEGENDARY_ANIMAL_TILES
  lineSize = LEGENDARY_ANIMAL_TILES_PER_LINE
  gap = LEGENDARY_ANIMAL_TILES_GAP
  lineGap = LEGENDARY_ANIMAL_TILES_LINE_GAP

  getItemIndex(item: MaterialItem) {
    return item.id - 1
  }

  getHoverTransform(item: MaterialItem, context: ItemContext) {
    return zoomOnHover(this, item, context)
  }
}

/**
 * The Dig Sites, laid out from a first pawn rather than heaped: the pieces of a stock are all alike,
 * so what an index has to tell apart here is the copies of one static item, which is exactly what
 * `getItemIndex` falls back on when a location carries no coordinate of its own.
 *
 * The stock is never counted out of, so the row never changes length: the framework draws the
 * quantity the description declares, and this row is that quantity, at rest.
 */
const digSitePawnsLocator = new ListLocator({ coordinates: DIG_SITE_PAWNS, gap: DIG_SITE_PAWNS_GAP })

/**
 * Loose pieces, tight and barely tilted: a supply reads as a neat heap, not as pieces spilled — and
 * the tighter the heap, the less of the bay it takes, which is what lets both of them share the one
 * strip the row of Dig Sites leaves.
 *
 * The gold is the tighter of the two: a coin is 2.4 cm tall for the 3 cm of that strip, where a
 * disc of 1 cm has room to lie about. The coins go here at all because they are the stock declared
 * by their description, not items of the game state, and they are money anyway — nobody ever picks
 * one out, the framework makes the change itself.
 */
const reserveCoinsLocator = new PileLocator({ coordinates: RESERVE_COINS, radius: { x: 1.2, y: 0.8 } })

const animalPawnsLocator = new PileLocator({ coordinates: ANIMAL_PAWNS, radius: { x: 1.5, y: 0.8 } })

/**
 * Unique, so nothing to spread and no heap to suggest: it waits squarely on its own spot, next to
 * the Relic deck. A pile's tilt would only push it into its neighbour for no gain.
 */
class InstantVictoryLocator extends Locator<number, MaterialType, LocationType> {
  coordinates = INSTANT_VICTORY_TILE

  getHoverTransform(item: MaterialItem<number, LocationType>, context: ItemContext<number, MaterialType, LocationType>) {
    return zoomOnHover(this, item, context)
  }
}

const instantVictoryLocator = new InstantVictoryLocator()

const reserveLocators: Partial<Record<MaterialType, Locator<number, MaterialType, LocationType>>> = {
  [MaterialType.RelicTile]: relicDeckLocator,
  [MaterialType.LegendaryAnimalTile]: new LegendaryAnimalTilesLocator(),
  [MaterialType.InstantVictoryTile]: instantVictoryLocator,
  [MaterialType.DigSitePawn]: digSitePawnsLocator,
  [MaterialType.AnimalPawn]: animalPawnsLocator,
  [MaterialType.Coin]: reserveCoinsLocator
}

export const reserveLocator = new ReserveLocator()
