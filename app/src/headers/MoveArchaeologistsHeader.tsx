import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { EffectType } from '@gamepark/aurealis/material/Effect'
import { Memory } from '@gamepark/aurealis/Memory'
import { CustomMoveType } from '@gamepark/aurealis/rules/CustomMoveType'
import { HeaderText, useRules } from '@gamepark/react-game'
import { isCustomMoveType } from '@gamepark/rules-api'

/**
 * Archaeologist moves left to spend. Some cards and Temple tiles let each of them be taken as gold
 * instead, which is a different thing to say: taking the gold ends the gain, where passing gives it
 * up (see {@link MoveArchaeologistsRule}).
 *
 * Only passing is a button of the header. Gold is taken on the player's own Camp de base, where the
 * expedition comes home rather than walking any further (see BaseCampCardDescription): what a player
 * gets is on the table, and the header says where.
 */
export const MoveArchaeologistsHeader = () => {
  const rules = useRules<AurealisRules>()
  const gold = rules?.remind<{ type: EffectType }>(Memory.CurrentEffect)?.type === EffectType.MovesOrGold
  const count = rules?.remind<number>(Memory.Remaining) ?? 0
  if (gold) return <HeaderText code="move-archaeologists-or-gold" values={{ count }} />
  return <HeaderText code="move-archaeologists" values={{ count }} moves={{ pass: isCustomMoveType(CustomMoveType.Pass) }} />
}
