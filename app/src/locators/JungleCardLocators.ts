import { getAnimalSpaces, getArchaeologistSpaces, Jungle } from '@gamepark/aurealis/material/Jungle'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { ListLocator, LocationDescription, Locator, MaterialContext, ParentFace } from '@gamepark/react-game'
import { Location, XYCoordinates } from '@gamepark/rules-api'
import {
  ARCHAEOLOGIST_ON_SPACE_OFFSET,
  DIG_SITE_ON_SPACE_OFFSET,
  JUNGLE_ANIMAL_BONUS,
  JUNGLE_ANIMAL_SPACE,
  JUNGLE_ANIMAL_SPACE_HIGHLIGHT,
  JUNGLE_ANIMAL_SPACE_STEP,
  JUNGLE_ARCHAEOLOGIST_SPACE,
  JUNGLE_ARCHAEOLOGIST_SPACE_STEP,
  JUNGLE_DIG_SITE_BONUS,
  JUNGLE_EXTRA_ARCHAEOLOGISTS,
  JUNGLE_EXTRA_ARCHAEOLOGISTS_GAP,
  JUNGLE_EXTRA_ARCHAEOLOGISTS_MAX
} from './TableLayout'

/**
 * The spaces printed on a Jungle card. They are positioned on the card itself, so they follow it
 * wherever it is — in the market, in either player's jungle — which is what a pawn standing on the
 * card does on a real table.
 *
 * The default {@link ParentFace.Front} is right for the four printed ones: the completed face of a
 * Jungle card is a bare illustration with no space at all, so whatever was on them is out of reach
 * once the card is turned over. The Archaeologists that have no space of their own are the exception
 * — they stand on the card itself, whichever face is up.
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

/**
 * The same discs, drawn rather than held: the areas the tutorial points at when it says that Animal
 * pawns go there (see {@link LocationType.JungleAnimalSpaceHighlight}).
 *
 * They hold nothing and are shown by nothing — {@link Locator.getLocations} leaves them out, so they
 * only ever exist while a focus asks for them. A focus on a location of an item masks that item
 * around it, and that is the whole point: the card dims, the column stays lit.
 */
class JungleAnimalSpaceHighlightLocator extends JungleAnimalSpaceLocator {
  locationDescription = new LocationDescription({
    width: JUNGLE_ANIMAL_SPACE_HIGHLIGHT,
    height: JUNGLE_ANIMAL_SPACE_HIGHLIGHT,
    borderRadius: JUNGLE_ANIMAL_SPACE_HIGHLIGHT / 2
  })
}

/**
 * The Archaeologists standing on the card outside its printed spaces: the ones that arrived once the
 * column was full, and the ones left on a card turned onto its completed face, which has no space at
 * all. Hence {@link ParentFace.Up}: they belong to the card, not to one of its faces.
 *
 * A column of their own down the middle of the card, built like the printed one — from the same
 * bottom line, upwards, at the same step, the pawns lifted the same way. The team simply carries on
 * where the card ran out of slots, and past 3 of them the column tightens rather than grows.
 */
class JungleExtraArchaeologistsLocator extends ListLocator {
  parentItemType = MaterialType.JungleCard
  parentFace = ParentFace.Up
  positionOnParent = JUNGLE_EXTRA_ARCHAEOLOGISTS
  gap = JUNGLE_EXTRA_ARCHAEOLOGISTS_GAP
  maxCount = JUNGLE_EXTRA_ARCHAEOLOGISTS_MAX

  getCoordinates() {
    return ARCHAEOLOGIST_ON_SPACE_OFFSET
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
export const jungleAnimalSpaceHighlightLocator = new JungleAnimalSpaceHighlightLocator()
export const jungleExtraArchaeologistsLocator = new JungleExtraArchaeologistsLocator()
export const jungleDigSiteBonusLocator = new JungleDigSiteBonusLocator()
export const jungleAnimalBonusLocator = new JungleAnimalBonusLocator()
