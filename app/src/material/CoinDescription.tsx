/** @jsxImportSource @emotion/react */
import { faCoins } from '@fortawesome/free-solid-svg-icons/faCoins'
import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { CustomMoveType } from '@gamepark/aurealis/rules/CustomMoveType'
import { ComponentSize, ItemContext, MoneyDescription } from '@gamepark/react-game'
import { isCustomMoveType, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { ItemMenuActions } from '../theme/ItemMenuActions'
import { CoinHelp } from './help/CoinHelp'
import coin1 from '../images/tokens/Coin1.png'
import coin3 from '../images/tokens/Coin3.png'

/**
 * The one unit of the supply the "take gold" button hangs from, and the reason the reserve heap pins
 * it to its middle (see {@link ReserveLocator}): the menu of a static item is drawn once per unit,
 * so a button offered by every coin would be sixteen buttons in a heap.
 */
export const GOLD_BUTTON_ANCHOR = { index: 0, displayIndex: 0 }

/**
 * Coins are money, not individual tokens: one item per denomination and location, carrying a
 * quantity. MoneyDescription is what sums a stack into a single "n gold" tooltip; the item id is the
 * denomination, so the images are keyed by the value itself.
 *
 * The two denominations are not the same size, hence the per-id size. Both dimensions include the
 * transparent margin holding each coin's baked-in shadow: with `transparency` the framework adds no
 * shadow of its own, and the coin renders at its true 16 mm / 24 mm.
 */
class CoinDescription extends MoneyDescription<number, MaterialType, LocationType, number> {
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

  /**
   * Taking gold instead of walking Archaeologists (see MoveArchaeologistsRule), offered on the heap
   * the gold comes from rather than on the Camp de base: the moves are spent on the jungle row and
   * what is left of them is cashed in here, so the two halves of that choice are two different
   * places on the table rather than two buttons side by side.
   *
   * On the middle of the heap, not above it: the row of Dig Sites runs 2.3 cm over the coins, and
   * covering a stock nothing is ever counted out of costs nothing while the offer stands.
   */
  getItemMenu(
    item: MaterialItem<number, LocationType, number>,
    context: ItemContext<number, MaterialType, LocationType>,
    legalMoves: MaterialMove<number, MaterialType, LocationType>[]
  ) {
    // The gold a player owns is made of real items, indexed apart from the static ones: only the
    // supply carries the button, and only the one unit of it the heap pins to its middle.
    if (item.location.type !== LocationType.Reserve) return null
    if (context.index !== GOLD_BUTTON_ANCHOR.index || context.displayIndex !== GOLD_BUTTON_ANCHOR.displayIndex) return null
    const gold = legalMoves.find(isCustomMoveType(CustomMoveType.GainGold))
    if (!gold) return null
    return <ItemMenuActions actions={[{ move: gold, icon: faCoins, title: 'button.take-gold', label: String(gold.data) }]} />
  }
}

export const coinDescription = new CoinDescription()
