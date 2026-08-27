import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { DelegateLocator, FlexLocator, isItemContext, ItemContext, Locator, MaterialContext, PileLocator } from '@gamepark/react-game'
import { Location, MaterialItem, XYCoordinates } from '@gamepark/rules-api'
import { StackLocator, zoomOnHover } from './HoverZoom'
import {
  ANIMAL_PAWNS,
  DIG_SITE_PAWNS,
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
 * Animal tiles, a heap of pawns. Each delegate counts only the type it places, which is what keeps
 * the 40-odd pieces of the supply from being counted as one heap.
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
 * Loose pieces, tight and barely tilted: a supply reads as a neat heap, not as pieces spilled — and
 * the tighter the heap, the less of the bay it takes, which is what lets the three of them share one.
 *
 * The coins go here too: they are the stock declared by their description, not items of the game
 * state, and they are money anyway — nobody ever picks one out, the framework makes the change itself.
 */
class SupplyPileLocator extends PileLocator {
  radius = 0.35
  maxAngle = 10

  constructor(private readonly spot: XYCoordinates) {
    super()
  }

  getCoordinates() {
    return this.spot
  }
}

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
  [MaterialType.DigSitePawn]: new SupplyPileLocator(DIG_SITE_PAWNS),
  [MaterialType.AnimalPawn]: new SupplyPileLocator(ANIMAL_PAWNS),
  [MaterialType.Coin]: new SupplyPileLocator(RESERVE_COINS)
}

export const reserveLocator = new ReserveLocator()
