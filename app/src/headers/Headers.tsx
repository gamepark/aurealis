import { RuleId } from '@gamepark/aurealis/rules/RuleId'
import { ComponentType } from 'react'
import { AcquireJungleHeader } from './AcquireJungleHeader'
import { BaseCampDiscardHeader } from './BaseCampDiscardHeader'
import { ChooseActionHeader } from './ChooseActionHeader'
import { ChooseEffectHeader } from './ChooseEffectHeader'
import { ChooseTempleTileHeader } from './ChooseTempleTileHeader'
import { MoveArchaeologistsHeader } from './MoveArchaeologistsHeader'
import { PlaceAnimalsHeader } from './PlaceAnimalsHeader'
import { RefillHandHeader } from './RefillHandHeader'
import { SendArchaeologistsHeader } from './SendArchaeologistsHeader'

/**
 * What the players read above the table, one step of the rules at a time.
 *
 * {@link RuleId.ResolveEffects} only ever waits for one thing: the gain to pick out of the two a
 * card offers on either side of a slash. Everything else it does needs no one.
 */
export const Headers: Partial<Record<RuleId, ComponentType>> = {
  [RuleId.ChooseAction]: ChooseActionHeader,
  [RuleId.BaseCampDiscard]: BaseCampDiscardHeader,
  [RuleId.ResolveEffects]: ChooseEffectHeader,
  [RuleId.MoveArchaeologists]: MoveArchaeologistsHeader,
  [RuleId.SendArchaeologists]: SendArchaeologistsHeader,
  [RuleId.PlaceAnimals]: PlaceAnimalsHeader,
  [RuleId.AcquireJungle]: AcquireJungleHeader,
  [RuleId.ChooseTempleTile]: ChooseTempleTileHeader,
  [RuleId.RefillHand]: RefillHandHeader
}
