import { DeckLocator, ListLocator } from '@gamepark/react-game'
import {
  ADVENTURER_DECK,
  ADVENTURER_DISCARD,
  ADVENTURER_RIVER,
  ADVENTURER_RIVER_GAP,
  FAME_TILES,
  JUNGLE_DECK,
  JUNGLE_MARKET,
  JUNGLE_MARKET_GAP,
  TEMPLE_TILES,
  TILES_ROW_GAP
} from './TableLayout'

/**
 * The common area, laid out as one horizontal band across the middle of the table: the Adventurer
 * cards on the left, the Jungle cards in the centre, the tiles on display on the right.
 */

/** Face down, and the fifth back of the river: it sits at the head of the row of 4 revealed slots. */
export const adventurerDeckLocator = new DeckLocator({ coordinates: ADVENTURER_DECK })

export const adventurerRiverLocator = new ListLocator({ coordinates: ADVENTURER_RIVER, gap: ADVENTURER_RIVER_GAP })

/** Face up, on the far side of the deck, so the two piles can never be mistaken for one another. */
export const adventurerDiscardLocator = new DeckLocator({ coordinates: ADVENTURER_DISCARD })

/** Face up, and the third card of the market. */
export const jungleDeckLocator = new DeckLocator({ coordinates: JUNGLE_DECK })

export const jungleMarketLocator = new ListLocator({ coordinates: JUNGLE_MARKET, gap: JUNGLE_MARKET_GAP })

export const templeTilesRowLocator = new ListLocator({ coordinates: TEMPLE_TILES, gap: TILES_ROW_GAP })

/** Right under the Temple tiles: a Fame tile is not owned for good, it moves from one player to the other. */
export const fameTilesRowLocator = new ListLocator({ coordinates: FAME_TILES, gap: TILES_ROW_GAP })
