import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { MaterialDescription } from '@gamepark/react-game'
import { adventurerCardDescription } from './AdventurerCardDescription'
import { baseCampCardDescription } from './BaseCampCardDescription'
import { coinDescription } from './CoinDescription'
import { jungleCardDescription } from './JungleCardDescription'
import { animalPawnDescription, archaeologistPawnDescription, digSitePawnDescription } from './PawnDescriptions'
import {
  fameTileDescription,
  instantVictoryTileDescription,
  legendaryAnimalTileDescription,
  relicTileDescription,
  templeTileDescription
} from './TileDescriptions'

export const Material: Partial<Record<MaterialType, MaterialDescription>> = {
  [MaterialType.AdventurerCard]: adventurerCardDescription,
  [MaterialType.JungleCard]: jungleCardDescription,
  [MaterialType.BaseCampCard]: baseCampCardDescription,
  [MaterialType.TempleTile]: templeTileDescription,
  [MaterialType.FameTile]: fameTileDescription,
  [MaterialType.RelicTile]: relicTileDescription,
  [MaterialType.LegendaryAnimalTile]: legendaryAnimalTileDescription,
  [MaterialType.InstantVictoryTile]: instantVictoryTileDescription,
  [MaterialType.Coin]: coinDescription,
  [MaterialType.ArchaeologistPawn]: archaeologistPawnDescription,
  [MaterialType.DigSitePawn]: digSitePawnDescription,
  [MaterialType.AnimalPawn]: animalPawnDescription
}
