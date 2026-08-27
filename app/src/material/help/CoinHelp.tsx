import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { playerGold } from '@gamepark/aurealis/material/Coin'
import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialHelpProps, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { helpBlock, helpIntro, helpLocation, helpSection, helpTitle } from './helpStyles'

/**
 * Gold. There is exactly one thing to buy with it — a Jungle card — so the dialog says that first
 * and says it plainly: gold that buys nothing is gold that does nothing, and a player short of two
 * coins is a player whose whole hand may be unplayable (see {@link ChooseActionRule}).
 *
 * The denominations are worth a line and no more. Change is made for the player, so a 3 and three 1s
 * are the same three gold, and nobody ever has to pick which coins to spend.
 */
export const CoinHelp: FC<MaterialHelpProps> = ({ item }) => {
  const { t } = useTranslation()
  const rules = useRules<AurealisRules>()
  const player = usePlayerId<number>()
  const owner = item.location?.type === LocationType.PlayerCoins ? item.location.player : undefined
  const name = usePlayerName(owner)
  return (
    <>
      <h2 css={helpTitle}>{t('help.gold.title')}</h2>
      <p css={helpIntro}>
        <Trans i18nKey="help.gold.intro">
          <strong />
        </Trans>
      </p>
      <div css={helpSection}>{t('help.gold.earning')}</div>
      <div css={helpBlock}>
        <ul>
          <li>
            <Trans i18nKey="help.gold.from-cards" />
          </li>
          <li>
            <Trans i18nKey="help.gold.from-moves" />
          </li>
          <li>
            <Trans i18nKey="help.gold.denominations" />
          </li>
        </ul>
      </div>
      {rules && owner !== undefined && (
        <p css={helpLocation}>
          <Trans i18nKey={owner === player ? 'help.gold.mine' : 'help.gold.player'} values={{ player: name, gold: playerGold(rules, owner) }} />
        </p>
      )}
      {owner === undefined && (
        <p css={helpLocation}>
          <Trans i18nKey="help.gold.reserve" />
        </p>
      )}
    </>
  )
}
