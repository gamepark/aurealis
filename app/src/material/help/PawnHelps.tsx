import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { archaeologistsAtCamp } from '@gamepark/aurealis/material/Archaeologists'
import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { MaterialHelpProps, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { helpBlock, helpIntro, helpLocation, helpSection, helpTitle } from './helpStyles'

/**
 * The three moulded pieces. None of them is ever chosen — one Archaeologist is worth another, and the
 * supply of Dig Sites and Animals is treated as inexhaustible — so what a dialog has to say about
 * them is never "which one", always "what it is doing there".
 */

/**
 * An Archaeologist: 7 per player, and the only piece that walks. Where it stands is what it is worth
 * — a printed slot is what a Dig Site is built out of, and the middle of a card is where the ones
 * with no slot left wait (rulebook p.7).
 */
export const ArchaeologistPawnHelp: FC<MaterialHelpProps> = ({ item }) => {
  const { t } = useTranslation()
  const rules = useRules<AurealisRules>()
  const player = usePlayerId<number>()
  const owner = ownerOfPawn(rules, item)
  const name = usePlayerName(owner)
  return (
    <>
      <h2 css={helpTitle}>{t('help.archaeologist.title')}</h2>
      <p css={helpIntro}>
        <Trans i18nKey="help.archaeologist.intro" />
      </p>
      <div css={helpSection}>{t('help.archaeologist.moving')}</div>
      <div css={helpBlock}>
        <ul>
          <li>
            <Trans i18nKey="help.archaeologist.send" />
          </li>
          <li>
            <Trans i18nKey="help.archaeologist.move" />
          </li>
        </ul>
      </div>
      <div css={helpSection}>{t('help.archaeologist.dig-site')}</div>
      <div css={helpBlock}>
        <Trans i18nKey="help.archaeologist.dig-site-text" />
      </div>
      <p css={helpLocation}>
        <ArchaeologistPlace item={item} />
        {rules && owner !== undefined && (
          <Trans
            i18nKey={owner === player ? 'help.archaeologist.at-camp.mine' : 'help.archaeologist.at-camp'}
            values={{ player: name, count: archaeologistsAtCamp(rules, owner).length }}
          />
        )}
      </p>
    </>
  )
}

/** Which of the three places the pawn is standing in: the camp, a printed slot, or the card itself. */
const ArchaeologistPlace: FC<Pick<MaterialHelpProps, 'item'>> = ({ item }) => {
  switch (item.location?.type) {
    case LocationType.BaseCampArchaeologists:
      return <Trans i18nKey="help.archaeologist.place.camp" />
    case LocationType.JungleArchaeologistSpace:
      return <Trans i18nKey="help.archaeologist.place.slot" />
    case LocationType.JungleExtraArchaeologists:
      return <Trans i18nKey="help.archaeologist.place.extra" />
    default:
      return null
  }
}

/**
 * Whose pawn it is. At the camp the pawn carries its owner; on a Jungle card it carries the card, and
 * the card carries the player — a card belongs to one jungle, and the pawns on it to that jungle's
 * owner.
 */
const ownerOfPawn = (rules: AurealisRules | undefined, item: MaterialHelpProps['item']): number | undefined => {
  if (item.location?.player !== undefined) return item.location.player
  if (!rules || item.location?.parent === undefined) return undefined
  return rules.material(MaterialType.JungleCard).getItem(item.location.parent)?.location.player
}

/**
 * A Dig Site: the building of it is a whole turn, and it is the only piece that never leaves the card
 * it was put on. What it unlocks is the Bonus Fouilles printed under it (rulebook p.7).
 */
export const DigSitePawnHelp: FC<MaterialHelpProps> = () => {
  const { t } = useTranslation()
  return (
    <>
      <h2 css={helpTitle}>{t('help.dig-site.title')}</h2>
      <p css={helpIntro}>
        <Trans i18nKey="help.dig-site.intro">
          <strong />
        </Trans>
      </p>
      <div css={helpSection}>{t('help.dig-site.building')}</div>
      <div css={helpBlock}>
        <ul>
          <li>
            <Trans i18nKey="help.dig-site.requirement" />
          </li>
          <li>
            <Trans i18nKey="help.dig-site.archaeologists-return" />
          </li>
          <li>
            <Trans i18nKey="help.dig-site.bonus" />
          </li>
        </ul>
      </div>
    </>
  )
}

/**
 * An Animal pawn: placed on the free Animal spaces of one's own Jungle cards. Filling a card's
 * spaces is what unlocks its Bonus Animal — and the pawns are then taken back apart from the one
 * that slides onto the bonus space to record it (rulebook p.5).
 */
export const AnimalPawnHelp: FC<MaterialHelpProps> = () => {
  const { t } = useTranslation()
  return (
    <>
      <h2 css={helpTitle}>{t('help.animal.title')}</h2>
      <p css={helpIntro}>
        <Trans i18nKey="help.animal.intro" />
      </p>
      <div css={helpSection}>{t('help.animal.bonus')}</div>
      <div css={helpBlock}>
        <ul>
          <li>
            <Trans i18nKey="help.animal.filling" />
          </li>
          <li>
            <Trans i18nKey="help.animal.returned" />
          </li>
          <li>
            <Trans i18nKey="help.animal.exploration" />
          </li>
        </ul>
      </div>
    </>
  )
}
