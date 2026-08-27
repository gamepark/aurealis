import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { Coordinates, MaterialRules, XYCoordinates } from '@gamepark/rules-api'

/**
 * The whole table, in centimetres, x rightwards and y downwards from the centre.
 *
 * Three bands, the players' own areas above and below the common one. A player's area is one band of
 * material, not two rows: everything they own is packed along their edge of the table, and only what
 * does not fit there is set just above it.
 *
 * ```
 *   gold          opponent's tiles
 *   panel         opponent's hand      Camp | opponent's jungle
 *                                          | Relics Victory  gold sites |
 *   discard deck river | Jungle deck market | Temples        animals | legendary animals
 *                                          | Fames                  |
 *   panel         player's hand        Camp | player's jungle
 *   gold          player's tiles
 * ```
 *
 * A player's area is given once, for the near player, and reflected across the middle of the table
 * for the far one: same left-right order, opposite side. Nothing is turned upside down — an item
 * reads the same way for both players — except the far player's hand, which is face down anyway and
 * fans towards them.
 */

/** Adventurer card 4.4 x 7, Jungle and Camp de base cards 6.3 x 8.8, every tile 3 x 3. */
const ADVENTURER_STEP = 4.9
const JUNGLE_WIDTH = 6.3
const JUNGLE_STEP = JUNGLE_WIDTH + 0.7
/** In a player own jungle the cards are laid edge to edge, parted by a hair so each one reads apart. */
const JUNGLE_ROW_STEP = JUNGLE_WIDTH + 0.1
const TILE_WIDTH = 3
const TILE_STEP = TILE_WIDTH + 0.3

/**
 * The left edge, where the Adventurer discard reaches once it is full and where the panel is laid.
 * The right edge is not a constant: see {@link COMMON_AREA_RIGHT} and {@link jungleRowEnd}.
 */
export const TABLE_LEFT = -42.5
/**
 * The hand and the Camp de base end 15.2 cm below the middle; what reaches furthest down is the lower
 * pair of power buttons, whose discs hang to 16.7 (see BaseCampCardDescription). Half a table height
 * has to cover that, or they fall outside the table and off the bottom of a phone screen.
 */
export const TABLE_HEIGHT = 33.6

// ---------------------------------------------------------------- common area, the middle band

/**
 * The Adventurer cards. The discard is a pile that grows towards the left edge of the table as it
 * fans, so it is set 1.3 cm short of it: at 20 cards displayed the topmost is 0.95 cm further left
 * than the bottom one, and it is that card, not the bottom of the pile, that must stay on the table.
 */
export const ADVENTURER_DISCARD: XYCoordinates = { x: -38, y: 0 }
export const ADVENTURER_DECK: XYCoordinates = { x: -33, y: 0 }
/** First of the 4 slots. With the deck on their left they read as the river of 5 backs. */
export const ADVENTURER_RIVER: XYCoordinates = { x: -28, y: 0 }
export const ADVENTURER_RIVER_GAP: XYCoordinates = { x: ADVENTURER_STEP, y: 0 }

/** Far enough right that the deck clears the last slot of the river: 6.3 cm of card needs the room. */
export const JUNGLE_DECK: XYCoordinates = { x: -6.2, y: 0 }
/** First of the 2 slots, the deck being the third card of the market. */
export const JUNGLE_MARKET: XYCoordinates = { x: 0.8, y: 0 }
export const JUNGLE_MARKET_GAP: XYCoordinates = { x: JUNGLE_STEP, y: 0 }

/**
 * The tiles on display, as a grid of 3 rows: the 4 Temple tiles, the 4 Fame tiles, then the Relic
 * deck and the Instant Victory tile. Stacking that third row on the other two rather than beside
 * them is what frees the width the supply and the Legendary Animals need.
 */
export const TEMPLE_TILES: XYCoordinates = { x: 13.5, y: 0 }
export const FAME_TILES: XYCoordinates = { x: 13.5, y: TILE_STEP }
export const TILES_ROW_GAP: XYCoordinates = { x: TILE_STEP, y: 0 }

/** The 9 Relic tiles are identical, so they are a deck rather than a row: one tile's worth of table. */
export const RELIC_DECK: XYCoordinates = { x: 13.5, y: -TILE_STEP }
export const INSTANT_VICTORY_TILE: XYCoordinates = { x: 16.8, y: -TILE_STEP }

/**
 * The supply proper: gold, Dig Sites and Animals, the three stocks nothing is ever counted out of.
 *
 * They are tucked into the bay the tile grid leaves open — right of the Instant Victory tile, above
 * the Temple tiles, under the Jungle cards of the opponent — which is 8 cm wide and barely 5 cm high.
 *
 * The Dig Sites take the top of it, all six in a row: a meeple is a shape, and six of them heaped
 * read as one lump where a row reads as six pieces. The other two stay heaps and share the strip
 * left under them, gold on the left and Animals on its right: coins are money, told apart by
 * nothing, and the Animals are discs — neither says anything more lined up than piled, and neither
 * has the width for a row anyway now that the Dig Sites have taken it.
 */

/** Six in a row, a step shorter than a pawn is wide: their bases nearly touch, and none is hidden. */
export const DIG_SITE_PAWNS: XYCoordinates = { x: 19.3, y: -5.3 }
export const DIG_SITE_PAWNS_GAP: XYCoordinates = { x: 1.2, y: 0 }

/**
 * The two heaps, on the one line the row of Dig Sites leaves: 3 cm of height for a coin of 2.4 and a
 * disc of 1, which is what sets how far each may spread (see the radiuses in ReserveLocator).
 */
export const RESERVE_COINS: XYCoordinates = { x: 20.8, y: -2.98 }
export const ANIMAL_PAWNS: XYCoordinates = { x: 24.4, y: -2.98 }

/**
 * The 9 Legendary Animal tiles are all different: laid out 3 by 3, each one can be looked at. They
 * close the common area, so where they end is where the table may stop.
 *
 * On the very lines of the tile grid on their left: the two blocks are the same three rows, and the
 * supply lies between them without breaking them apart.
 */
export const LEGENDARY_ANIMAL_TILES: XYCoordinates = { x: 27.8, y: -TILE_STEP }
export const LEGENDARY_ANIMAL_TILES_PER_LINE = 3
export const LEGENDARY_ANIMAL_TILES_GAP: XYCoordinates = { x: 3.3, y: 0 }
export const LEGENDARY_ANIMAL_TILES_LINE_GAP: XYCoordinates = { x: 0, y: 3.3 }

/**
 * Where the common area stops, and with it the narrowest the table can ever be. Nothing here moves
 * with the game, so this is a constant: only a player jungle longer than 6 cards pushes the table
 * past it (see {@link jungleRowEnd}).
 */
export const COMMON_AREA_RIGHT =
  LEGENDARY_ANIMAL_TILES.x + LEGENDARY_ANIMAL_TILES_GAP.x * (LEGENDARY_ANIMAL_TILES_PER_LINE - 1) + TILE_WIDTH / 2 + 0.5

// ---------------------------------------- a player's own area, given for the player facing the table

/**
 * Along the very edge of the table, 1 cm of margin apart: the panel, the hand next to it, then the
 * Camp de base and the jungle it opens onto. The panel is laid over the first 12 cm; it is 28em wide,
 * and an em is a hundredth of the shorter side of the window, which comes to some 12 cm of table
 * whatever the shape of the screen.
 */

/**
 * Tight: the cards touch without hiding one another, so the hand takes as little room as it can, and
 * set as close to the panel as it can safely go. The panel is 29 em from the left edge of the table,
 * and an em is worth about 0.38 cm of table whichever way the window is shaped — so its right edge
 * sits at about -31.4 whatever the screen, and the hand starts 1.2 cm further right.
 */
export const PLAYER_HAND: XYCoordinates = { x: -20.1, y: 11.7 }
export const PLAYER_HAND_RADIUS = 400
export const PLAYER_HAND_MAX_ANGLE = 2.5

export const PLAYER_BASE_CAMP: XYCoordinates = { x: -5.65, y: 10.8 }
/**
 * The Archaeologist pawns waiting at the camp, over the illustration of the card: a team of 7 stands
 * as a flat-topped hexagon, one in the middle and six around them. Given as an offset from the card
 * to its centre, which is the only thing that keeps the team on it once the card is reflected.
 *
 * The first pawn is the middle one, so a team that has been sent out into the jungle keeps the
 * remaining pawns exactly where they were rather than closing ranks after every departure.
 */
export const BASE_CAMP_ARCHAEOLOGISTS_OFFSET: XYCoordinates = { x: 0, y: -1.2 }
/** Also the distance between two pawns of the ring: a hexagon's side equals its circumradius. */
export const ARCHAEOLOGISTS_HEX_RADIUS = 1.6

/**
 * The jungle grows rightwards from the Camp de base, all but touching it and one another: the row
 * reads as one strip of explored land. Never overlapping, though — what is printed along both edges
 * of a Jungle card has to stay readable.
 *
 * Six of them fit in the width the common area needs anyway, so up to there they are free. Past that
 * each card widens the table and costs a little size to every piece of material — see
 * {@link jungleRowEnd}.
 */
export const PLAYER_JUNGLE: XYCoordinates = { x: 0.75, y: 10.8 }
export const PLAYER_JUNGLE_GAP: XYCoordinates = { x: JUNGLE_ROW_STEP, y: 0 }

/**
 * How far right the table has to reach for a player holding this many Jungle cards.
 *
 * Up to 6 cards it stays within {@link COMMON_AREA_RIGHT} and costs nothing: the common area is then
 * what sets the right edge. The 7th card takes the table to 42.5, the 8th to 48.9, and so on — it
 * grows only rightwards, nothing of the common area moves, it simply stops short of the new edge.
 */
export const jungleRowEnd = (cards: number): number => PLAYER_JUNGLE.x + JUNGLE_ROW_STEP * (cards - 1) + JUNGLE_WIDTH / 2 + 0.5

/**
 * The right edge of the table as it stands: the common area, unless somebody's jungle reaches
 * further. Asked by the display to size the table, and by a hovered piece to know where the screen
 * stops (see HoverZoom).
 */
export const tableRight = (rules: MaterialRules<number, MaterialType, LocationType>): number => Math.max(COMMON_AREA_RIGHT, jungleRowEnd(longestJungle(rules)))

/** The longest jungle in play: it is the row that reaches furthest right, whoever it belongs to. */
const longestJungle = (rules: MaterialRules<number, MaterialType, LocationType>): number =>
  rules.players.reduce(
    (longest, player) => Math.max(longest, rules.material(MaterialType.JungleCard).location(LocationType.PlayerJungle).player(player).length),
    0
  )

// Just above, towards the middle of the table: the gold over the panel, the tiles over the hand.

/**
 * The gold, spread over the whole strip left over above the panel. Centred on the panel rather than
 * on any of its own material: the strip is what the gold is given, and the middle of the panel is
 * the middle of that strip. High enough to clear the panel, which grows taller in centimetres as the
 * table gets shorter.
 */
export const PLAYER_COINS: XYCoordinates = { x: -36.8, y: 10 }
/**
 * How far a coin may fall from the middle of the strip. Far wider than tall, which is the shape of
 * what is free there, and spread to the very edges of it: 4.2 cm either way plus half of the widest
 * coin reaches from the left edge of the table to just short of the hand, and 0.7 cm up and down
 * fills the height between the tiles won, whose line closes the strip above, and the top of the
 * panel, which would cover any coin that fell below it.
 *
 * The 3s and the 1s share it: they are one player's gold, not two heaps to be read apart, and a
 * strip this wide is what lets a handful of coins lie in it without any one covering another.
 */
export const PLAYER_COINS_RADIUS: XYCoordinates = { x: 4.2, y: 0.7 }

/**
 * Won tiles, in a single line over the hand: the 7th one ends the game, and one line of 7 is 3.3 cm
 * shorter than two lines of 4 — height the table would otherwise waste over its whole width.
 *
 * The line ends where the Camp de base begins, which is what sets its left end: it is laid out from
 * the left, and the room it needs was taken from the empty stretch above the panel.
 */
export const PLAYER_TILES: XYCoordinates = { x: -31, y: 6.4 }
export const PLAYER_TILES_PER_LINE = 7
export const PLAYER_TILES_GAP: XYCoordinates = { x: TILE_STEP, y: 0 }
export const PLAYER_TILES_LINE_GAP: XYCoordinates = { x: 0, y: -TILE_STEP }

// ----------------------------------------------------------- spaces printed on a Jungle card, in %

/**
 * Read off the 744 x 1039 px card artwork, by finding the white stroke that outlines every space.
 * Both columns are bottom-aligned: a card carries 1 to 4 spaces of either kind, and the extra ones
 * are added *above* a lowest space every card shares. Which is why the position of the first space
 * of a column depends on how many that card has — see {@link getArchaeologistSpaces} and
 * {@link getAnimalSpaces}.
 */
/** The lowest space of the column, the one every card has. The box measures 1.26 x 0.90 cm. */
export const JUNGLE_ARCHAEOLOGIST_SPACE: XYCoordinates = { x: 16.8, y: 68.1 }
export const JUNGLE_ARCHAEOLOGIST_SPACE_STEP = 11.9
/** Likewise, and a disc of 0.97 cm: an Animal pawn lies flat in it, so it needs no lift. */
export const JUNGLE_ANIMAL_SPACE: XYCoordinates = { x: 84.7, y: 67.5 }
export const JUNGLE_ANIMAL_SPACE_STEP = 13.3
/**
 * The Archaeologists with no slot of their own: a column of their own down the middle of the card,
 * between the two printed ones and clear of both. It starts on the very line the lowest printed slot
 * stands on and grows upwards, exactly as the printed column does — so a card whose slots are full
 * reads as two columns of pawns side by side, not as a heap beside a row.
 */
export const JUNGLE_EXTRA_ARCHAEOLOGISTS: XYCoordinates = { x: 50, y: JUNGLE_ARCHAEOLOGIST_SPACE.y }
/** Upwards, in centimetres: the step of the printed column, 11.9% of a card 8.8 cm tall. */
export const JUNGLE_EXTRA_ARCHAEOLOGISTS_GAP: Partial<Coordinates> = { x: 0, y: -1.5, z: -0.1 }
/**
 * Past 3 the column stops growing and the pawns close ranks inside the height it already takes: a
 * card can end up holding a whole team of 7, and 7 of them at full step would run off the top of it.
 */
export const JUNGLE_EXTRA_ARCHAEOLOGISTS_MAX = 3

/** The bonus bar at the foot of the card, 1.43 x 1.19 cm. */
export const JUNGLE_DIG_SITE_BONUS: XYCoordinates = { x: 17.3, y: 87.7 }
export const JUNGLE_ANIMAL_BONUS: XYCoordinates = { x: 80.6, y: 87.4 }

/**
 * The Archaeologist and the Dig Site are standing pieces drawn lying flat, and both are taller than
 * the space they occupy. They stand *on* their space rather than in it: their feet are set on the
 * bottom edge of the space, and the piece rises off the card from there.
 *
 * Hence half the difference between the two heights, which is a lift since the piece is the taller:
 * (0.90 - 1.3) / 2 for the Archaeologist, (1.19 - 1.7) / 2 for the Dig Site.
 */
export const ARCHAEOLOGIST_ON_SPACE_OFFSET: Partial<Coordinates> = { x: 0, y: -0.2, z: 1 }
export const DIG_SITE_ON_SPACE_OFFSET: XYCoordinates = { x: 0, y: -0.26 }
