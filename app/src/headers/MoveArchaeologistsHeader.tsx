import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { EffectType } from '@gamepark/aurealis/material/Effect'
import { Memory } from '@gamepark/aurealis/Memory'
import { CustomMoveType } from '@gamepark/aurealis/rules/CustomMoveType'
import { HeaderText, useRules } from '@gamepark/react-game'
import { isCustomMoveType } from '@gamepark/rules-api'

/**
 * Archaeologist moves left to spend. Some cards and Temple tiles let each of them be taken as gold
 * instead, which is a different thing to say: there the button takes what is left as gold and ends
 * the gain, where the other one gives it up (see {@link MoveArchaeologistsRule}).
 */
export const MoveArchaeologistsHeader = () => {
  const rules = useRules<AurealisRules>()
  const gold = rules?.remind<{ type: EffectType }>(Memory.CurrentEffect)?.type === EffectType.MovesOrGold
  const count = rules?.remind<number>(Memory.Remaining) ?? 0
  if (gold) return <HeaderText code="move-archaeologists-or-gold" values={{ count }} moves={{ gold: isCustomMoveType(CustomMoveType.GainGold) }} />
  return <HeaderText code="move-archaeologists" values={{ count }} moves={{ pass: isCustomMoveType(CustomMoveType.Pass) }} />
}
