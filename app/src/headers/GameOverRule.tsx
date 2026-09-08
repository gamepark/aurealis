import { css } from '@emotion/react'
import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { TILES_TO_WIN } from '@gamepark/aurealis/Constants'
import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { Tile } from '@gamepark/aurealis/material/Tile'
import { Memory } from '@gamepark/aurealis/Memory'
import { usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { Trans, useTranslation } from 'react-i18next'
import { helpIntro, helpLocation, helpTitle } from '../material/help/helpStyles'

/**
 * Why the game is over, behind the (?) of the result header.
 *
 * The header only ever says who won, and the two ways of winning look nothing alike from the table:
 * a row of 7 tiles that has been filling up for a while, or a Temple tile taken one move ago that
 * stopped the game on the spot (rulebook p.11). Which one it was is the question the losing player
 * asks, so it is the one sentence this dialog answers — followed by the other ending, since knowing
 * the one that did not happen is what makes the one that did read as a rule rather than a verdict.
 *
 * The winner is read from {@link Memory.Winner}, as the ranking is: the rule that ended the game is
 * gone by the time this is displayed. The Instant Victory tile in front of them tells the two
 * endings apart — it is only ever handed out by {@link ChooseTempleTileRule}.
 */
export const GameOverRule = () => {
  const { t } = useTranslation()
  const rules = useRules<AurealisRules>()
  const player = usePlayerId<number>()
  const winner = rules?.remind<number | undefined>(Memory.Winner)
  const winnerName = usePlayerName(winner)
  const instantVictory =
    !!rules && winner !== undefined && rules.material(MaterialType.Tile).location(LocationType.PlayerTiles).player(winner).id(Tile.InstantVictory).length > 0
  const ending = instantVictory ? 'temples' : 'tiles'
  return (
    <div css={dialog}>
      <div css={content}>
        <h2 css={helpTitle}>{t('game-over.title')}</h2>
        <p css={helpIntro}>
          {winner === undefined ? (
            <Trans i18nKey="game-over.unknown" values={{ total: TILES_TO_WIN }} />
          ) : (
            <Trans i18nKey={`game-over.${ending}.${winner === player ? 'you' : 'player'}`} values={{ player: winnerName, total: TILES_TO_WIN }} />
          )}
        </p>
        {winner !== undefined && (
          <p css={helpLocation}>
            <Trans i18nKey={`game-over.${ending}.other`} values={{ total: TILES_TO_WIN }} />
          </p>
        )}
      </div>
    </div>
  )
}

/** The padding {@link RulesHelpDialogContent} gives a rules help, which this dialog is one of. */
const dialog = css`
  display: flex;
  padding: 3em;
  max-width: inherit;
  max-height: inherit;
`

/**
 * The same 2.4em body as every help of the game, over a measure narrow enough to read: nothing in
 * here is longer than a couple of sentences, and a dialog that grew to the width of the screen for
 * them would put its one sentence on one line.
 */
const content = css`
  font-size: 2.4em;
  max-width: 16em;
  overflow: auto;
`
