import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { HAND_SIZE } from '@gamepark/aurealis/Constants'
import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { HeaderText, useRules } from '@gamepark/react-game'

/**
 * Step IV: the cards still to take from the river. They are drawn face down and land on the stand
 * that way, so what is left to pick is the only thing worth saying (see {@link RefillHandRule}).
 */
export const RefillHandHeader = () => {
  const rules = useRules<AurealisRules>()
  const player = rules?.getActivePlayer()
  const hand =
    rules === undefined || player === undefined ? 0 : rules.material(MaterialType.AdventurerCard).location(LocationType.PlayerHand).player(player).length
  return <HeaderText code="refill-hand" values={{ count: HAND_SIZE - hand }} />
}
