import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { Tile, TilePile } from '@gamepark/aurealis/material/Tile'
import { FlexLocator, isItemContext, ItemContext, ListLocator, Locator, MaterialContext, PileLocator } from '@gamepark/react-game'
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
 * there comes from what is being placed: a pile of Relic tiles, a grid of Legendary Animal tiles, a
 * row of pawns, two heaps beside it. Each delegate places only what it is given, which is what keeps
 * the 40-odd pieces of the supply from being laid out as one stock.
 *
 * The tiles are told apart by the `id` of their location, not by their material type — they are all
 * one material now (see {@link Tile}), and the three heaps they form here are three location ids
 * (see {@link TilePile}). Everything else is told apart by its type, as before: the pawns and the
 * gold have no location id, being static items of their descriptions rather than items of the game.
 */
class ReserveLocator extends Locator<number, MaterialType, LocationType> {
  placeItem(item: MaterialItem<number, LocationType>, context: ItemContext<number, MaterialType, LocationType>) {
    return this.getDelegate(item.location, context).placeItem(item, context)
  }

  placeLocation(location: Location, context: MaterialContext<number, MaterialType, LocationType>) {
    return this.getDelegate(location, context).placeLocation(location, context)
  }

  getPositionDependencies(location: Location, context: MaterialContext<number, MaterialType, LocationType>) {
    return this.getDelegate(location, context).getPositionDependencies(location, context)
  }

  /** Tiles grow under the pointer, gold and pawns do not: what a delegate says goes here too. */
  getHoverTransform(item: MaterialItem<number, LocationType>, context: ItemContext<number, MaterialType, LocationType>) {
    return this.getDelegate(item.location, context).getHoverTransform(item, context)
  }

  private getDelegate(location: Location, context: MaterialContext<number, MaterialType, LocationType>) {
    if (location.id !== undefined) return tilePileLocators[location.id as TilePile] ?? instantVictoryLocator
    return (isItemContext(context) && reserveLocators[context.type]) || instantVictoryLocator
  }
}

/** The 9 Relic tiles are identical, and only the one on top of the pile is ever taken. */
const relicDeckLocator = new StackLocator({ coordinates: RELIC_DECK })

/** The 9 Legendary Animal tiles all differ, and none ever comes back: each keeps its own square. */
class LegendaryAnimalTilesLocator extends FlexLocator {
  coordinates = LEGENDARY_ANIMAL_TILES
  lineSize = LEGENDARY_ANIMAL_TILES_PER_LINE
  gap = LEGENDARY_ANIMAL_TILES_GAP
  lineGap = LEGENDARY_ANIMAL_TILES_LINE_GAP

  getItemIndex(item: MaterialItem) {
    return item.id - Tile.LegendaryAnimal1
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

/** The three heaps of tiles the supply keeps apart, each addressed by the `id` of its location. */
const tilePileLocators: Record<TilePile, Locator<number, MaterialType, LocationType>> = {
  [TilePile.Relic]: relicDeckLocator,
  [TilePile.LegendaryAnimal]: new LegendaryAnimalTilesLocator(),
  [TilePile.InstantVictory]: instantVictoryLocator
}

const reserveLocators: Partial<Record<MaterialType, Locator<number, MaterialType, LocationType>>> = {
  [MaterialType.DigSitePawn]: digSitePawnsLocator,
  [MaterialType.AnimalPawn]: animalPawnsLocator,
  [MaterialType.Coin]: reserveCoinsLocator
}

export const reserveLocator = new ReserveLocator()
