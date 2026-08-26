import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { HAND_SIZE } from '@gamepark/aurealis/Constants'
import { BASE_CAMP_COST } from '@gamepark/aurealis/material/BaseCamp'
import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { HeaderText, useRules } from '@gamepark/react-game'

/**
 * The 3 cards a Camp de base action costs, counted down as they are given. Nothing keeps that count:
 * a hand always begins a turn with 5 cards, so what is still owed is what it holds above 2
 * (see {@link BaseCampDiscardRule}).
 */
export const BaseCampDiscardHeader = () => {
  const rules = useRules<AurealisRules>()
  const player = rules?.getActivePlayer()
  const hand =
    rules === undefined || player === undefined
      ? HAND_SIZE
      : rules.material(MaterialType.AdventurerCard).location(LocationType.PlayerHand).player(player).length
  return <HeaderText code="base-camp-discard" values={{ count: hand - (HAND_SIZE - BASE_CAMP_COST) }} />
}
