import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { Tile } from '@gamepark/aurealis/material/Tile'
import { TokenDescription } from '@gamepark/react-game'
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
 * Every tile of the game is the same 30 x 30 mm square, so one description covers them all: what
 * changes from one to the next is the picture on it, and the help it opens (see {@link TileHelp}).
 * The 9 Relic tiles share a single image, being identical in the box as well.
 */
class TileDescription extends TokenDescription<number, MaterialType, LocationType, Tile> {
  width = 3
  height = 3
  borderRadius = 0.3
  help = TileHelp

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
}

export const tileDescription = new TileDescription()
