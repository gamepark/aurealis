import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { Locator } from '@gamepark/react-game'
import {
  adventurerDeckLocator,
  adventurerDiscardLocator,
  adventurerRiverLocator,
  fameTilesRowLocator,
  jungleDeckLocator,
  jungleMarketLocator,
  templeTilesRowLocator
} from './CommonLocators'
import { jungleAnimalBonusLocator, jungleAnimalSpaceLocator, jungleArchaeologistSpaceLocator, jungleDigSiteBonusLocator } from './JungleCardLocators'
import {
  baseCampArchaeologistsLocator,
  baseCampLocator,
  playerCoinsLocator,
  playerHandLocator,
  playerJungleLocator,
  playerTilesLocator
} from './PlayerLocators'
import { reserveLocator } from './ReserveLocator'

export const Locators: Partial<Record<LocationType, Locator<number, MaterialType, LocationType>>> = {
  [LocationType.PlayerHand]: playerHandLocator,
  [LocationType.AdventurerDeck]: adventurerDeckLocator,
  [LocationType.AdventurerRiver]: adventurerRiverLocator,
  [LocationType.AdventurerDiscard]: adventurerDiscardLocator,
  [LocationType.JungleDeck]: jungleDeckLocator,
  [LocationType.JungleMarket]: jungleMarketLocator,
  [LocationType.PlayerJungle]: playerJungleLocator,
  [LocationType.BaseCamp]: baseCampLocator,
  [LocationType.BaseCampArchaeologists]: baseCampArchaeologistsLocator,
  [LocationType.JungleArchaeologistSpace]: jungleArchaeologistSpaceLocator,
  [LocationType.JungleAnimalSpace]: jungleAnimalSpaceLocator,
  [LocationType.JungleDigSiteBonus]: jungleDigSiteBonusLocator,
  [LocationType.JungleAnimalBonus]: jungleAnimalBonusLocator,
  [LocationType.TempleTilesRow]: templeTilesRowLocator,
  [LocationType.FameTilesRow]: fameTilesRowLocator,
  [LocationType.PlayerTiles]: playerTilesLocator,
  [LocationType.PlayerCoins]: playerCoinsLocator,
  [LocationType.Reserve]: reserveLocator
}
