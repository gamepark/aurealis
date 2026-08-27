import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { DeckLocator, ItemContext, Locator } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import { TABLE_HEIGHT, TABLE_LEFT, tableRight } from './TableLayout'

/**
 * Every card and every tile of this game is printed with more on it than its place on the table can
 * show: an Adventurer card is 4.4 cm wide and carries two conditions and their effects, a tile 3 cm
 * square and carries what it is worth and what it asks for. So the pointer resting on one blows it
 * up where it lies, and reading the table stops being a matter of opening a dialog per piece.
 */

/**
 * How tall a hovered piece is brought, in centimetres of table. The table is 33.6 cm high, so this
 * is a little under half the screen: enough to read the small print of a card on a phone, little
 * enough to leave in sight what the piece was picked out of.
 */
const HOVER_HEIGHT = 14

/**
 * Never more than three times its size, though. A 3 cm tile taken to 14 would cover a third of the
 * table, and it carries an illustration and two numbers — three times over is already more than it
 * takes to read them.
 */
const HOVER_MAX_SCALE = 3

/** How much table is kept between a hovered piece and the edge of the screen. */
const HOVER_MARGIN = 0.5

/**
 * Above everything else on the table. The piece grows over its neighbours rather than pushing them
 * aside, so it has to be the one in front — including over the pawns standing on the very card being
 * hovered, which are 1 cm off it.
 */
const HOVER_LIFT = 10

/**
 * The piece, grown in place and brought back inside the table if that took it out of it.
 *
 * Three steps, in the order a transform list applies them: the piece is lifted above the table, put
 * back straight — the cards of a hand are fanned, and a card blown up on a slant is harder to read,
 * not easier — then moved by whatever it takes to keep it on the screen, and finally grown.
 *
 * The move is computed in the frame the rotation has just undone, which is the table's own: the
 * bounds it is clamped against are table coordinates, and only there do x and y mean left-right and
 * up-down. It is applied before the scale for the same reason — a translate that came after would be
 * multiplied by it, and its distances are centimetres of table, not of blown-up card.
 */
export const zoomOnHover = (
  locator: Locator<number, MaterialType, LocationType>,
  item: MaterialItem<number, LocationType>,
  context: ItemContext<number, MaterialType, LocationType>
): string[] => {
  const description = context.material[context.type]
  if (!description) return []
  const { width, height } = description.getSize(item.id)
  const scale = Math.min(HOVER_HEIGHT / height, HOVER_MAX_SCALE)
  if (scale <= 1) return []
  const { x = 0, y = 0 } = locator.getItemCoordinates(item, context)
  const dx = keepInside(x, (width * scale) / 2, TABLE_LEFT + HOVER_MARGIN, tableRight(context.rules) - HOVER_MARGIN)
  const dy = keepInside(y, (height * scale) / 2, -TABLE_HEIGHT / 2 + HOVER_MARGIN, TABLE_HEIGHT / 2 - HOVER_MARGIN)
  const rotation = locator.getItemRotateZ(item, context)
  return [
    `translateZ(${HOVER_LIFT}em)`,
    ...(rotation ? [`rotateZ(${-rotation}${locator.rotationUnit})`] : []),
    ...(dx || dy ? [`translate(${round(dx)}em, ${round(dy)}em)`] : []),
    `scale(${round(scale)})`
  ]
}

/**
 * How far a piece of half-size `half` centred on `centre` has to travel for both its edges to fall
 * between `min` and `max`. Zero when it already does, which is the case of everything that is not
 * against an edge of the table.
 *
 * A piece too big for the gap is centred in it rather than pinned to one of its ends: it overflows
 * on both sides by the same amount, and what is cut off is the margin of the illustration rather
 * than one whole edge of the card.
 */
const keepInside = (centre: number, half: number, min: number, max: number): number => {
  if (max - min < half * 2) return (min + max) / 2 - centre
  return Math.min(Math.max(centre, min + half), max - half) - centre
}

/** Two decimals is a hundredth of a centimetre of table: past that the string only gets longer. */
const round = (value: number): number => Math.round(value * 100) / 100

/**
 * A pile — a draw pile, a discard, the stack of Relic tiles — where only the piece on top is a piece
 * of the game: the others are a thickness under it, drawn 0.5 mm apart so that the pile looks like
 * one, and reachable by the pointer only along that edge.
 *
 * So the pile answers as one piece. Only its top grows under the pointer, and the help of any card
 * of it is the help of the card on top (see the `displayHelp` of the card descriptions) — which is
 * also why the navigation arrows are taken off it: they would walk through a deck the player is not
 * meant to be reading, one buried card at a time.
 */
export class StackLocator extends DeckLocator<number, MaterialType, LocationType> {
  navigationSorts = []

  getHoverTransform(item: MaterialItem<number, LocationType>, context: ItemContext<number, MaterialType, LocationType>) {
    return this.isTop(item, context) ? zoomOnHover(this, item, context) : []
  }

  /**
   * The last one placed, which is the one the others are drawn behind. `getItemIndex` already caps
   * the pile at the 20 cards it displays, so this is the top of the pile whatever its height.
   */
  isTop(item: MaterialItem<number, LocationType>, context: ItemContext<number, MaterialType, LocationType>): boolean {
    return this.getItemIndex(item, context) === this.countListItems(item.location, context) - 1
  }
}
