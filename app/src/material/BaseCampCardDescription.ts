import { BaseCamp } from '@gamepark/aurealis/material/BaseCamp'
import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { CardDescription } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import baseCamp1A from '../images/cards/basecamps/BaseCamp1A.jpg'
import baseCamp1B from '../images/cards/basecamps/BaseCamp1B.jpg'
import baseCamp2A from '../images/cards/basecamps/BaseCamp2A.jpg'
import baseCamp2B from '../images/cards/basecamps/BaseCamp2B.jpg'
import baseCamp3A from '../images/cards/basecamps/BaseCamp3A.jpg'
import baseCamp3B from '../images/cards/basecamps/BaseCamp3B.jpg'
import baseCamp4A from '../images/cards/basecamps/BaseCamp4A.jpg'
import baseCamp4B from '../images/cards/basecamps/BaseCamp4B.jpg'

/**
 * Same shape as a Jungle card. Face A (improved, used from the start of the game) is the front and
 * face B (standard) the back, so a rotated card is one that has been turned onto its B side.
 * As with Jungle cards nothing is hidden here, so the flip follows the location rotation.
 */
class BaseCampCardDescription extends CardDescription<number, MaterialType, LocationType, BaseCamp> {
  width = 6.3
  height = 8.8

  isFlipped(item: Partial<MaterialItem<number, LocationType, BaseCamp>>) {
    return !!item.location?.rotation
  }

  images = {
    [BaseCamp.BaseCamp1]: baseCamp1A,
    [BaseCamp.BaseCamp2]: baseCamp2A,
    [BaseCamp.BaseCamp3]: baseCamp3A,
    [BaseCamp.BaseCamp4]: baseCamp4A
  }

  backImages = {
    [BaseCamp.BaseCamp1]: baseCamp1B,
    [BaseCamp.BaseCamp2]: baseCamp2B,
    [BaseCamp.BaseCamp3]: baseCamp3B,
    [BaseCamp.BaseCamp4]: baseCamp4B
  }
}

export const baseCampCardDescription = new BaseCampCardDescription()
