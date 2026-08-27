import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { EffectOf, EffectType } from '@gamepark/aurealis/material/Effect'
import { Memory } from '@gamepark/aurealis/Memory'
import { HeaderText, useRules } from '@gamepark/react-game'
import { DeckBottomJungleDialog } from '../dialogs/DeckBottomJungleDialog'

/**
 * A Jungle card to take, at the price the effect that opened this rule sets (see {@link AcquireJungleRule}).
 *
 * The 3 cards of the market are picked on the table itself, each with a button of its own. The 3
 * cards at the bottom of the deck have nowhere to carry one — they are buried under the pile — so
 * those are picked in a dialog instead (see {@link DeckBottomJungleDialog}).
 */
export const AcquireJungleHeader = () => {
  const rules = useRules<AurealisRules>()
  const effect = rules?.remind<EffectOf<EffectType.BuyJungle> | undefined>(Memory.CurrentEffect)
  return (
    <>
      <HeaderText code="acquire-jungle" values={{ cost: effect?.cost ?? 0 }} />
      {effect?.fromDeckBottom && <DeckBottomJungleDialog />}
    </>
  )
}
