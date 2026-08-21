import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { MaterialDescription } from '@gamepark/react-game'
import { adventurerCardDescription } from './AdventurerCardDescription'
import { baseCampCardDescription } from './BaseCampCardDescription'
import { coinDescription } from './CoinDescription'
import { jungleCardDescription } from './JungleCardDescription'
import {
  fameTileDescription,
  instantVictoryTileDescription,
  legendaryAnimalTileDescription,
  relicTileDescription,
  templeTileDescription
} from './TileDescriptions'

/**
 * The Archaeologist, Dig Site and Animal pawns are missing: they are moulded pieces, and no artwork
 * for them came with the print files, so they have no description yet.
 */
export const Material: Partial<Record<MaterialType, MaterialDescription>> = {
  [MaterialType.AdventurerCard]: adventurerCardDescription,
  [MaterialType.JungleCard]: jungleCardDescription,
  [MaterialType.BaseCampCard]: baseCampCardDescription,
  [MaterialType.TempleTile]: templeTileDescription,
  [MaterialType.FameTile]: fameTileDescription,
  [MaterialType.RelicTile]: relicTileDescription,
  [MaterialType.LegendaryAnimalTile]: legendaryAnimalTileDescription,
  [MaterialType.InstantVictoryTile]: instantVictoryTileDescription,
  [MaterialType.Coin]: coinDescription
}
