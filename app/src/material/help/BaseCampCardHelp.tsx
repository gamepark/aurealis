import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { archaeologistsAtCamp } from '@gamepark/aurealis/material/Archaeologists'
import { BASE_CAMP_COST, BaseCamp, BaseCampPower, getBaseCampPowerEffects, isImprovedPower } from '@gamepark/aurealis/material/BaseCamp'
import { MaterialHelpProps, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Effects } from './EffectDescription'
import { helpBlock, helpBlockActive, helpCondition, helpIntro, helpLocation, helpSection, helpTitle } from './helpStyles'

/** The four powers in the order they are printed along the foot of the card. */
const POWERS = [BaseCampPower.Gold, BaseCampPower.Animal, BaseCampPower.Moves, BaseCampPower.Jungle]

/**
 * The Camp de base: the action a player takes when their hand has nothing better to offer, and the
 * one that costs them 3 cards off their stand (rulebook p.9).
 *
 * Its four powers are the same on every card but one: face A improves a single one of them, on a
 * light background, and using that one turns the card onto its face B. So the improvement is worth
 * exactly one use — which is the whole decision the card asks for, and what the dialog leads with.
 */
export const BaseCampCardHelp: FC<MaterialHelpProps> = ({ item }) => {
  const { t } = useTranslation()
  const rules = useRules<AurealisRules>()
  const camp = item.id as BaseCamp | undefined
  if (!rules || camp === undefined) return null
  // The card is turned over the moment its improved power is spent: face A up means it is still there.
  const improvable = !item.location?.rotation
  const owner = item.location?.player
  return (
    <>
      <h2 css={helpTitle}>{t('help.base-camp.title')}</h2>
      <p css={helpIntro}>
        <Trans i18nKey="help.base-camp.intro" values={{ count: BASE_CAMP_COST }}>
          <strong />
        </Trans>
      </p>

      <div css={helpSection}>{t('help.base-camp.powers')}</div>
      {POWERS.map((power) => {
        const improved = improvable && isImprovedPower(camp, power)
        return (
          <div key={power} css={[helpBlock, improved && helpBlockActive]}>
            <span css={helpCondition}>{t(`help.base-camp.power.${power}`)}</span>
            <Effects effects={getBaseCampPowerEffects(camp, power, improved)} />
            {improved && <p>{t('help.base-camp.improved')}</p>}
          </div>
        )
      })}
      <p css={helpIntro}>{t(improvable ? 'help.base-camp.face-a' : 'help.base-camp.face-b')}</p>

      <div css={helpSection}>{t('help.base-camp.team')}</div>
      <div css={helpBlock}>
        <Trans i18nKey="help.base-camp.team-text" values={{ count: owner !== undefined ? archaeologistsAtCamp(rules, owner).length : 0 }} />
      </div>
      <BaseCampLocation item={item} />
    </>
  )
}

const BaseCampLocation: FC<Pick<MaterialHelpProps, 'item'>> = ({ item }) => {
  const player = usePlayerId<number>()
  const name = usePlayerName(item.location?.player)
  const mine = item.location?.player !== undefined && item.location.player === player
  return (
    <p css={helpLocation}>
      <Trans i18nKey={mine ? 'help.base-camp.mine' : 'help.base-camp.player'} values={{ player: name }} />
    </p>
  )
}
