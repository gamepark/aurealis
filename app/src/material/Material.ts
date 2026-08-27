import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { MaterialDescription } from '@gamepark/react-game'
import { adventurerCardDescription } from './AdventurerCardDescription'
import { baseCampCardDescription } from './BaseCampCardDescription'
import { coinDescription } from './CoinDescription'
import { jungleCardDescription } from './JungleCardDescription'
import { animalPawnDescription, archaeologistPawnDescription, digSitePawnDescription } from './PawnDescriptions'
import { tileDescription } from './TileDescriptions'

export const Material: Partial<Record<MaterialType, MaterialDescription>> = {
  [MaterialType.AdventurerCard]: adventurerCardDescription,
  [MaterialType.JungleCard]: jungleCardDescription,
  [MaterialType.BaseCampCard]: baseCampCardDescription,
  [MaterialType.Tile]: tileDescription,
  [MaterialType.Coin]: coinDescription,
  [MaterialType.ArchaeologistPawn]: archaeologistPawnDescription,
  [MaterialType.DigSitePawn]: digSitePawnDescription,
  [MaterialType.AnimalPawn]: animalPawnDescription
}
