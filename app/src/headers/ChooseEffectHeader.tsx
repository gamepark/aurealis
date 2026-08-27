import { HeaderText } from '@gamepark/react-game'
import { ChooseEffectDialog } from '../dialogs/ChooseEffectDialog'

/**
 * The slash printed between two gains on a card: one of them, and only one (see {@link ResolveEffectsRule}).
 *
 * The bar only says what is happening, and the gain itself is picked in the middle of the table (see
 * {@link ChooseEffectDialog}): a choice offered in the bar alone is a choice a player who reads the
 * table first walks straight past. The dialog mounts itself on the moves being there, so it stays out
 * of the way of the opponent, of a spectator, and of the passes this rule makes with nothing to ask.
 */
export const ChooseEffectHeader = () => (
  <>
    <HeaderText code="choose-effect" />
    <ChooseEffectDialog />
  </>
)
