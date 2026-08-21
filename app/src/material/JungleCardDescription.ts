import { Jungle } from '@gamepark/aurealis/material/Jungle'
import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { CardDescription } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import jungle1 from '../images/cards/jungle/Jungle1.jpg'
import jungle2 from '../images/cards/jungle/Jungle2.jpg'
import jungle3 from '../images/cards/jungle/Jungle3.jpg'
import jungle4 from '../images/cards/jungle/Jungle4.jpg'
import jungle5 from '../images/cards/jungle/Jungle5.jpg'
import jungle6 from '../images/cards/jungle/Jungle6.jpg'
import jungle7 from '../images/cards/jungle/Jungle7.jpg'
import jungle8 from '../images/cards/jungle/Jungle8.jpg'
import jungle9 from '../images/cards/jungle/Jungle9.jpg'
import jungle10 from '../images/cards/jungle/Jungle10.jpg'
import jungle11 from '../images/cards/jungle/Jungle11.jpg'
import jungle12 from '../images/cards/jungle/Jungle12.jpg'
import jungle13 from '../images/cards/jungle/Jungle13.jpg'
import jungle14 from '../images/cards/jungle/Jungle14.jpg'
import jungle15 from '../images/cards/jungle/Jungle15.jpg'
import jungle16 from '../images/cards/jungle/Jungle16.jpg'
import jungle17 from '../images/cards/jungle/Jungle17.jpg'
import jungle18 from '../images/cards/jungle/Jungle18.jpg'
import jungle19 from '../images/cards/jungle/Jungle19.jpg'
import jungle20 from '../images/cards/jungle/Jungle20.jpg'
import jungle1Back from '../images/cards/jungle/backs/Jungle1Back.jpg'
import jungle2Back from '../images/cards/jungle/backs/Jungle2Back.jpg'
import jungle3Back from '../images/cards/jungle/backs/Jungle3Back.jpg'
import jungle4Back from '../images/cards/jungle/backs/Jungle4Back.jpg'
import jungle5Back from '../images/cards/jungle/backs/Jungle5Back.jpg'
import jungle6Back from '../images/cards/jungle/backs/Jungle6Back.jpg'
import jungle7Back from '../images/cards/jungle/backs/Jungle7Back.jpg'
import jungle8Back from '../images/cards/jungle/backs/Jungle8Back.jpg'
import jungle9Back from '../images/cards/jungle/backs/Jungle9Back.jpg'
import jungle10Back from '../images/cards/jungle/backs/Jungle10Back.jpg'
import jungle11Back from '../images/cards/jungle/backs/Jungle11Back.jpg'
import jungle12Back from '../images/cards/jungle/backs/Jungle12Back.jpg'
import jungle13Back from '../images/cards/jungle/backs/Jungle13Back.jpg'
import jungle14Back from '../images/cards/jungle/backs/Jungle14Back.jpg'
import jungle15Back from '../images/cards/jungle/backs/Jungle15Back.jpg'
import jungle16Back from '../images/cards/jungle/backs/Jungle16Back.jpg'
import jungle17Back from '../images/cards/jungle/backs/Jungle17Back.jpg'
import jungle18Back from '../images/cards/jungle/backs/Jungle18Back.jpg'
import jungle19Back from '../images/cards/jungle/backs/Jungle19Back.jpg'
import jungle20Back from '../images/cards/jungle/backs/Jungle20Back.jpg'

/**
 * Jungle cards are standard 63 x 88 mm. The id is a simple Jungle: both `images` and
 * `backImages` are keyed by it, since getFrontId and getBackId both return a non-object id as is.
 *
 * The verso is the *completed face*, turned over once the Dig Site and Animal bonuses are both taken
 * (rulebook p.5) — it is a game state, not hidden information. The default `isFlipped` keys off a
 * missing front, which never happens here, so the flip is driven by the location rotation instead.
 */
class JungleCardDescription extends CardDescription<number, MaterialType, LocationType, Jungle> {
  width = 6.3
  height = 8.8

  isFlipped(item: Partial<MaterialItem<number, LocationType, Jungle>>) {
    return !!item.location?.rotation
  }

  images = {
    [Jungle.Jungle1]: jungle1,
    [Jungle.Jungle2]: jungle2,
    [Jungle.Jungle3]: jungle3,
    [Jungle.Jungle4]: jungle4,
    [Jungle.Jungle5]: jungle5,
    [Jungle.Jungle6]: jungle6,
    [Jungle.Jungle7]: jungle7,
    [Jungle.Jungle8]: jungle8,
    [Jungle.Jungle9]: jungle9,
    [Jungle.Jungle10]: jungle10,
    [Jungle.Jungle11]: jungle11,
    [Jungle.Jungle12]: jungle12,
    [Jungle.Jungle13]: jungle13,
    [Jungle.Jungle14]: jungle14,
    [Jungle.Jungle15]: jungle15,
    [Jungle.Jungle16]: jungle16,
    [Jungle.Jungle17]: jungle17,
    [Jungle.Jungle18]: jungle18,
    [Jungle.Jungle19]: jungle19,
    [Jungle.Jungle20]: jungle20
  }

  backImages = {
    [Jungle.Jungle1]: jungle1Back,
    [Jungle.Jungle2]: jungle2Back,
    [Jungle.Jungle3]: jungle3Back,
    [Jungle.Jungle4]: jungle4Back,
    [Jungle.Jungle5]: jungle5Back,
    [Jungle.Jungle6]: jungle6Back,
    [Jungle.Jungle7]: jungle7Back,
    [Jungle.Jungle8]: jungle8Back,
    [Jungle.Jungle9]: jungle9Back,
    [Jungle.Jungle10]: jungle10Back,
    [Jungle.Jungle11]: jungle11Back,
    [Jungle.Jungle12]: jungle12Back,
    [Jungle.Jungle13]: jungle13Back,
    [Jungle.Jungle14]: jungle14Back,
    [Jungle.Jungle15]: jungle15Back,
    [Jungle.Jungle16]: jungle16Back,
    [Jungle.Jungle17]: jungle17Back,
    [Jungle.Jungle18]: jungle18Back,
    [Jungle.Jungle19]: jungle19Back,
    [Jungle.Jungle20]: jungle20Back
  }
}

export const jungleCardDescription = new JungleCardDescription()
