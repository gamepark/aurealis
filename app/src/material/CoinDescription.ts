import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { ComponentSize, MoneyDescription } from '@gamepark/react-game'
import { CoinHelp } from './help/CoinHelp'
import coin1 from '../images/tokens/Coin1.png'
import coin3 from '../images/tokens/Coin3.png'

/**
 * Coins are money, not individual tokens: one item per denomination and location, carrying a
 * quantity. MoneyDescription is what sums a stack into a single "n gold" tooltip; the item id is the
 * denomination, so the images are keyed by the value itself.
 *
 * The two denominations are not the same size, hence the per-id size. Both dimensions include the
 * transparent margin holding each coin's baked-in shadow: with `transparency` the framework adds no
 * shadow of its own, and the coin renders at its true 16 mm / 24 mm.
 */
class CoinDescription extends MoneyDescription {
  help = CoinHelp
  transparency = true

  images = {
    1: coin1,
    3: coin3
  }

  getSize(itemId: number): ComponentSize {
    return itemId === 3 ? { width: 2.9, height: 2.6 } : { width: 2, height: 2.2 }
  }

  stockLocation = { type: LocationType.Reserve }

  staticItems = [
    { id: 1, quantity: 10, location: this.stockLocation },
    { id: 3, quantity: 6, location: this.stockLocation }
  ]
}

export const coinDescription = new CoinDescription()
