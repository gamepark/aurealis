/**
 * Gold coins are not distinct pieces of material: a coin item is a denomination plus a quantity, and
 * `MaterialMoney` adds, spends and makes change across the denominations on its own. The item id is
 * the denomination itself, which is what makes `count` the sum of `id * quantity`.
 *
 * The box holds 18 coins worth 1 and 6 coins worth 3.
 *
 * Highest first: `MaterialMoney` walks the units in that order to make change, and only re-sorts an
 * array it is given ascending. Passed to `this.material(MaterialType.Coin).money(coins)`.
 */
export const coins = [3, 1]
