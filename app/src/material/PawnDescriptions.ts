import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { ItemContext, RoundTokenDescription, TokenDescription } from '@gamepark/react-game'
import { isMoveItemsAtOnce, MaterialMove } from '@gamepark/rules-api'
import { AnimalPawnHelp, ArchaeologistPawnHelp, DigSitePawnHelp } from './help/PawnHelps'
import animal from '../images/pawns/Animal.png'
import archaeologist from '../images/pawns/Archaeologist.png'
import digSite from '../images/pawns/DigSite.png'

/**
 * The three pawns are moulded pieces, so nothing states their size: it is read off the spaces they
 * are placed on, printed on the 63 x 88 mm Jungle cards (744 x 1039 px in the print files, so 118 px
 * per centimetre).
 *
 * The Archaeologist and the Dig Site stand upright: only their *base* touches the card, and the
 * image is that standing piece laid flat. So the space constrains the **width** alone — its height
 * is only the depth of a base, and the piece rises off the card well past it. The height therefore
 * comes from the image's own proportions, never from the space:
 * - Archaeologist space: 1.24 x 0.91 cm outside the white stroke, 1.16 x 0.84 cm inside it. Base
 *   1.15 cm wide, so the pawn sits within the frame and leaves it readable.
 * - Dig Site: its Bonus Fouilles space (~1.6 cm wide) carries the reward, not a picture of the pawn,
 *   so the house is scaled off the meeple instead — the Matériel page and the p.7 inset, the two
 *   figures drawing both pieces at one scale, put it at 1.13 to 1.16 times a meeple's width. Base
 *   1.33 cm wide, which its space takes comfortably.
 * - Animal is a disc lying flat, so its space gives both dimensions: 1.03 cm circle, 0.90 cm inside
 *   the white stroke.
 *
 * The values below are those targets grown by each image's transparent margin, so what shows on the
 * table is the pawn at the size above. The three images are low-quality placeholders whose
 * proportions are not those of the real pieces (the house comes out taller than a meeple here,
 * where the moulds are nearly level): redo this pass with the final artwork.
 *
 * A standing pawn is anchored by its base, not its centre — that offset belongs to the locators.
 */
class ArchaeologistPawnDescription extends TokenDescription<number, MaterialType, LocationType> {
  help = ArchaeologistPawnHelp
  transparency = true
  width = 1.3
  height = 1.3
  image = archaeologist

  /**
   * One pawn at a time under the pointer. A whole team stepping right together is a move of its own
   * (see MoveArchaeologistsRule), and it is a button on the card it walks onto — the `×3` of
   * {@link JungleCardDescription.archaeologistMenu} — because what it plays is the single move
   * several times over, and a group of pawns has no one piece to take hold of.
   *
   * Dragging it would say the opposite of what dropping it does: the framework offers to drag every
   * pawn the group move names, then plays the single move of the one actually held (see
   * DropAreaDescription.getBestDropMove). Three pawns travel, one lands.
   */
  canDrag(move: MaterialMove<number, MaterialType, LocationType>, context: ItemContext<number, MaterialType, LocationType>): boolean {
    return !isMoveItemsAtOnce(move) && super.canDrag(move, context)
  }
}

/**
 * The general supply is treated as inexhaustible: its pawns are static items of their description,
 * shown on the table but absent from the game state, and a pawn only becomes an item of the game
 * once it is on a card. The rulebook never says what happens when the box runs out (it only rules
 * on an empty Adventurer deck and on unavailable Temple tiles), so nothing here may depend on the
 * count — the quantities are the box's, so that the heap looks right, not so that it can empty.
 */
class DigSitePawnDescription extends TokenDescription<number, MaterialType, LocationType> {
  help = DigSitePawnHelp
  transparency = true
  width = 1.7
  height = 1.7
  image = digSite
  stockLocation = { type: LocationType.Reserve }
  staticItems = [{ quantity: 6, location: this.stockLocation }]
}

class AnimalPawnDescription extends RoundTokenDescription<number, MaterialType, LocationType> {
  help = AnimalPawnHelp
  transparency = true
  diameter = 1.2
  image = animal
  stockLocation = { type: LocationType.Reserve }
  staticItems = [{ quantity: 16, location: this.stockLocation }]
}

export const archaeologistPawnDescription = new ArchaeologistPawnDescription()
export const digSitePawnDescription = new DigSitePawnDescription()
export const animalPawnDescription = new AnimalPawnDescription()
