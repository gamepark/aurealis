import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { Fame } from '@gamepark/aurealis/material/Fame'
import { LegendaryAnimal } from '@gamepark/aurealis/material/LegendaryAnimal'
import { Temple } from '@gamepark/aurealis/material/Temple'
import { TokenDescription } from '@gamepark/react-game'
import { FameTileHelp, InstantVictoryTileHelp, LegendaryAnimalTileHelp, RelicTileHelp, TempleTileHelp } from './help/TileHelps'
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

/** Every tile in the game is the same 30 x 30 mm square. */
abstract class SquareTileDescription<Id = number> extends TokenDescription<number, MaterialType, LocationType, Id> {
  width = 3
  height = 3
  borderRadius = 0.3
}

class TempleTileDescription extends SquareTileDescription<Temple> {
  help = TempleTileHelp

  images = {
    [Temple.Temple1]: temple1,
    [Temple.Temple2]: temple2,
    [Temple.Temple3]: temple3,
    [Temple.Temple4]: temple4,
    [Temple.Temple5]: temple5,
    [Temple.Temple6]: temple6
  }
}

class FameTileDescription extends SquareTileDescription<Fame> {
  help = FameTileHelp

  images = {
    [Fame.Plant]: famePlant,
    [Fame.Jungle]: fameJungle,
    [Fame.LegendaryAnimal]: fameLegendaryAnimal,
    [Fame.Relic]: fameRelic
  }
}

class LegendaryAnimalTileDescription extends SquareTileDescription<LegendaryAnimal> {
  help = LegendaryAnimalTileHelp

  images = {
    [LegendaryAnimal.LegendaryAnimal1]: legendaryAnimal1,
    [LegendaryAnimal.LegendaryAnimal2]: legendaryAnimal2,
    [LegendaryAnimal.LegendaryAnimal3]: legendaryAnimal3,
    [LegendaryAnimal.LegendaryAnimal4]: legendaryAnimal4,
    [LegendaryAnimal.LegendaryAnimal5]: legendaryAnimal5,
    [LegendaryAnimal.LegendaryAnimal6]: legendaryAnimal6,
    [LegendaryAnimal.LegendaryAnimal7]: legendaryAnimal7,
    [LegendaryAnimal.LegendaryAnimal8]: legendaryAnimal8,
    [LegendaryAnimal.LegendaryAnimal9]: legendaryAnimal9
  }
}

/** The 9 Relic tiles are identical, and the Instant Victory tile is unique: a single image each. */
class RelicTileDescription extends SquareTileDescription {
  help = RelicTileHelp
  image = relic
}

class InstantVictoryTileDescription extends SquareTileDescription {
  help = InstantVictoryTileHelp
  image = instantVictory
}

export const templeTileDescription = new TempleTileDescription()
export const fameTileDescription = new FameTileDescription()
export const legendaryAnimalTileDescription = new LegendaryAnimalTileDescription()
export const relicTileDescription = new RelicTileDescription()
export const instantVictoryTileDescription = new InstantVictoryTileDescription()
