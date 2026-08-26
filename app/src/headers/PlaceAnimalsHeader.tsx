import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { Memory } from '@gamepark/aurealis/Memory'
import { HeaderText, useRules } from '@gamepark/react-game'

/** Animal pawns left to put on the free spaces of one's own Jungle cards (see {@link PlaceAnimalsRule}). */
export const PlaceAnimalsHeader = () => {
  const rules = useRules<AurealisRules>()
  return <HeaderText code="place-animals" values={{ count: rules?.remind<number>(Memory.Remaining) ?? 0 }} />
}
