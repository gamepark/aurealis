import { getAnimalSpaces, getArchaeologistSpaces, Jungle } from '@gamepark/aurealis/material/Jungle'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { Locator, MaterialContext } from '@gamepark/react-game'
import { Location, XYCoordinates } from '@gamepark/rules-api'
import {
  ARCHAEOLOGIST_ON_SPACE_OFFSET,
  DIG_SITE_ON_SPACE_OFFSET,
  JUNGLE_ANIMAL_BONUS,
  JUNGLE_ANIMAL_SPACE,
  JUNGLE_ANIMAL_SPACE_STEP,
  JUNGLE_ARCHAEOLOGIST_SPACE,
  JUNGLE_ARCHAEOLOGIST_SPACE_STEP,
  JUNGLE_DIG_SITE_BONUS
} from './TableLayout'

/**
 * The spaces printed on a Jungle card. They are positioned on the card itself, so they follow it
 * wherever it is — in the market, in either player's jungle — which is what a pawn standing on the
 * card does on a real table.
 *
 * The default {@link ParentFace.Front} is right for all four: the completed face of a Jungle card is
 * a bare illustration with no space at all, so whatever was on the card is out of reach once it is
 * turned over.
 */
abstract class JungleCardSpaceLocator extends Locator {
  parentItemType = MaterialType.JungleCard
}

/**
 * The column of 1 to 4 spaces along the left edge, filled from the top of the card downwards.
 *
 * The column is printed bottom-aligned, so the first space of a card with 2 of them is the *second*
 * space of a card with 3. Counting down from the top therefore means counting up from the lowest
 * space, which is the one every card shares — hence the card's own number of spaces.
 */
class JungleArchaeologistSpaceLocator extends JungleCardSpaceLocator {
  getPositionOnParent(location: Location, context: MaterialContext): XYCoordinates {
    const card = this.getParentItem(location, context)
    const spaces = card ? getArchaeologistSpaces(card.id as Jungle) : 1
    const fromBottom = spaces - 1 - (location.x ?? 0)
    return { x: JUNGLE_ARCHAEOLOGIST_SPACE.x, y: JUNGLE_ARCHAEOLOGIST_SPACE.y - JUNGLE_ARCHAEOLOGIST_SPACE_STEP * fromBottom }
  }

  getCoordinates() {
    return ARCHAEOLOGIST_ON_SPACE_OFFSET
  }
}

/**
 * The column of 1 to 4 discs along the right edge, filled from the top of the card downwards, and
 * bottom-aligned like the Archaeologist one. An Animal pawn is a disc lying flat in its space, so
 * unlike the standing pieces it sits on the middle of it.
 */
class JungleAnimalSpaceLocator extends JungleCardSpaceLocator {
  getPositionOnParent(location: Location, context: MaterialContext): XYCoordinates {
    const card = this.getParentItem(location, context)
    const fromBottom = (card ? getAnimalSpaces(card.id as Jungle) : 1) - 1 - (location.x ?? 0)
    return { x: JUNGLE_ANIMAL_SPACE.x, y: JUNGLE_ANIMAL_SPACE.y - JUNGLE_ANIMAL_SPACE_STEP * fromBottom }
  }
}

/** The single Dig Site space, bottom left. */
class JungleDigSiteBonusLocator extends JungleCardSpaceLocator {
  positionOnParent = JUNGLE_DIG_SITE_BONUS

  getCoordinates() {
    return DIG_SITE_ON_SPACE_OFFSET
  }
}

/** The single Animal bonus space, bottom right. */
class JungleAnimalBonusLocator extends JungleCardSpaceLocator {
  positionOnParent = JUNGLE_ANIMAL_BONUS
}

export const jungleArchaeologistSpaceLocator = new JungleArchaeologistSpaceLocator()
export const jungleAnimalSpaceLocator = new JungleAnimalSpaceLocator()
export const jungleDigSiteBonusLocator = new JungleDigSiteBonusLocator()
export const jungleAnimalBonusLocator = new JungleAnimalBonusLocator()
