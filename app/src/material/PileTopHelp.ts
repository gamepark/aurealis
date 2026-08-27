import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { ItemContext } from '@gamepark/react-game'
import { MaterialItem, MaterialMove, MaterialMoveBuilder } from '@gamepark/rules-api'

const displayMaterialHelp = MaterialMoveBuilder.displayMaterialHelp

/**
 * The help of the card on top of the pile the given card belongs to.
 *
 * A pile is drawn as a stack of cards half a millimetre apart, so a pointer aimed at the card on top
 * lands on the one under it as often as not — and on a discard, whose cards are all face up in the
 * game state, that would open the help of a card nobody is looking at. The pile answers as the one
 * card it shows, whichever of its cards was actually pressed.
 *
 * The top is the highest `x`: every pile of this game keeps a `PositiveSequenceStrategy` (see
 * AurealisRules), which is what orders it, and the display draws them in that same order.
 */
export const pileTopHelp = (
  item: MaterialItem<number, LocationType>,
  context: ItemContext<number, MaterialType, LocationType>
): MaterialMove<number, MaterialType, LocationType> | undefined => {
  const top = context.rules
    .material(context.type)
    .location(item.location.type)
    .maxBy((card) => card.location.x ?? 0)
  if (!top.length) return
  return displayMaterialHelp(context.type, top.getItem(), top.getIndex())
}
