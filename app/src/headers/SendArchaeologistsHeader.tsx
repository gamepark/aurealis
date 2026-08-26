import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { Memory } from '@gamepark/aurealis/Memory'
import { HeaderText, useRules } from '@gamepark/react-game'

/** Archaeologists to put on any Jungle card, from anywhere (see {@link SendArchaeologistsRule}). */
export const SendArchaeologistsHeader = () => {
  const rules = useRules<AurealisRules>()
  return <HeaderText code="send-archaeologists" values={{ count: rules?.remind<number>(Memory.Remaining) ?? 0 }} />
}
