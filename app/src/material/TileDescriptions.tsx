import { faHandBackFist } from '@fortawesome/free-solid-svg-icons/faHandBackFist'
import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { Tile } from '@gamepark/aurealis/material/Tile'
import { ItemContext, TokenDescription } from '@gamepark/react-game'
import { isMoveItemType, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { ItemMenuActions } from '../theme/ItemMenuActions'
import { TileHelp } from './help/TileHelps'
import fameJungle from '../images/tiles/FameJungle.jpg'
import fameLegendaryAnimal from '../images/tiles/FameLegendaryAnimal.jpg'
import famePlant from '../images/tiles/FamePlant.jpg'
import fameRelic from '../images/tiles/FameRelic.jpg'
import instantVictory from '../images/tiles/InstantVictory.jpg'
import legendaryAnimal1 from '../images/tiles/LegendaryAnimal1.jpg'
import legendaryAnimal2 from '../images/tiles/LegendaryAnimal2.jpg'
import legendaryAnimal3 from '../images/tiles/LegendaryAnimal3.jpg'
import legendaryAnimal4 from '../images/tiles/LegendaryAnimal4.jpg'
import legendaryAnimal5 from '../images/tiles/LegendaryAnimal5.jpg'
import legendaryAnimal6 from '../images/tiles/LegendaryAnimal6.jpg'
import legendaryAnimal7 from '../images/tiles/LegendaryAnimal7.jpg'
import legendaryAnimal8 from '../images/tiles/LegendaryAnimal8.jpg'
import legendaryAnimal9 from '../images/tiles/LegendaryAnimal9.jpg'
import relic from '../images/tiles/Relic.jpg'
import temple1 from '../images/tiles/Temple1.jpg'
import temple2 from '../images/tiles/Temple2.jpg'
import temple3 from '../images/tiles/Temple3.jpg'
import temple4 from '../images/tiles/Temple4.jpg'
import temple5 from '../images/tiles/Temple5.jpg'
import temple6 from '../images/tiles/Temple6.jpg'

/**
 * Over the top edge of a Temple tile rather than on it: what a Temple tile gives is printed in the
 * middle of the 3 cm square, and it is exactly what the player is comparing when the four buttons
 * are up. Half a button of overlap keeps it plainly attached to its own tile.
 */
const TAKE_BUTTON = { x: 0, y: -2.4 }

/**
 * Every tile of the game is the same 30 x 30 mm square, so one description covers them all: what
 * changes from one to the next is the picture on it, and the help it opens (see {@link TileHelp}).
 * The 9 Relic tiles share a single image, being identical in the box as well.
 */
class TileDescription extends TokenDescription<number, MaterialType, LocationType, Tile> {
  width = 3
  height = 3
  borderRadius = 0.3
  help = TileHelp

  /**
   * The Take buttons stand on the Temple tiles as soon as they can be pressed. Picking one is a
   * choice between four tiles whose effects have to be compared before any of them is touched, and
   * a menu that only opened on the tile already clicked would show them one at a time.
   */
  menuAlwaysVisible = true

  images = {
    [Tile.Temple1]: temple1,
    [Tile.Temple2]: temple2,
    [Tile.Temple3]: temple3,
    [Tile.Temple4]: temple4,
    [Tile.Temple5]: temple5,
    [Tile.Temple6]: temple6,
    [Tile.FamePlant]: famePlant,
    [Tile.FameJungle]: fameJungle,
    [Tile.FameLegendaryAnimal]: fameLegendaryAnimal,
    [Tile.FameRelic]: fameRelic,
    [Tile.Relic]: relic,
    [Tile.LegendaryAnimal1]: legendaryAnimal1,
    [Tile.LegendaryAnimal2]: legendaryAnimal2,
    [Tile.LegendaryAnimal3]: legendaryAnimal3,
    [Tile.LegendaryAnimal4]: legendaryAnimal4,
    [Tile.LegendaryAnimal5]: legendaryAnimal5,
    [Tile.LegendaryAnimal6]: legendaryAnimal6,
    [Tile.LegendaryAnimal7]: legendaryAnimal7,
    [Tile.LegendaryAnimal8]: legendaryAnimal8,
    [Tile.LegendaryAnimal9]: legendaryAnimal9,
    [Tile.InstantVictory]: instantVictory
  }

  /**
   * Taking one of the Temple tiles on display (see ChooseTempleTileRule). The tile plays that move
   * on a click of its own, but a tile only ever moves that one way and nothing on the table says so:
   * the button is what tells the player the row is theirs to take from.
   *
   * Only the row on display carries it. A Fame tile changes hands on the same kind of move (see
   * CheckFameRule) but it is never picked from a row — it is claimed where its owner keeps it.
   */
  getItemMenu(
    item: MaterialItem<number, LocationType, Tile>,
    context: ItemContext<number, MaterialType, LocationType>,
    legalMoves: MaterialMove<number, MaterialType, LocationType>[]
  ) {
    if (item.location.type !== LocationType.TempleTilesRow) return null
    const take = legalMoves.find((move) => isMoveItemType(MaterialType.Tile)(move) && move.itemIndex === context.index)
    if (!take) return null
    return <ItemMenuActions actions={[{ move: take, icon: faHandBackFist, title: 'button.take-temple', ...TAKE_BUTTON }]} />
  }
}

export const tileDescription = new TileDescription()
