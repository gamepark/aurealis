import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { EffectOf, EffectType } from '@gamepark/aurealis/material/Effect'
import { Memory } from '@gamepark/aurealis/Memory'
import { HeaderText, useRules } from '@gamepark/react-game'

/** A Jungle card to take, at the price the effect that opened this rule sets (see {@link AcquireJungleRule}). */
export const AcquireJungleHeader = () => {
  const rules = useRules<AurealisRules>()
  const effect = rules?.remind<EffectOf<EffectType.BuyJungle>>(Memory.CurrentEffect)
  return <HeaderText code="acquire-jungle" values={{ cost: effect?.cost ?? 0 }} />
}
