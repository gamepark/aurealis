import { css } from '@emotion/react'
import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { Effect, EffectOf, EffectType } from '@gamepark/aurealis/material/Effect'
import { Memory } from '@gamepark/aurealis/Memory'
import { CustomMoveType } from '@gamepark/aurealis/rules/CustomMoveType'
import { Dialog, PlayMoveButton, ThemeButton, useLegalMoves, useRules, useUndo } from '@gamepark/react-game'
import { CustomMove, isCustomMoveType } from '@gamepark/rules-api'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { EffectText } from '../material/help/EffectDescription'
import { colors } from '../theme/colors'
import { fontDisplay } from '../theme/typography'

/**
 * The slash printed between two gains on a card: one of them, and only one (see {@link ResolveEffectsRule}).
 *
 * Asked in the middle of the table rather than in the bar at the top of it, where a player who reads
 * the table first would walk past it. This is the whole of the choice: the bar behind it only says
 * what is happening (see {@link ChooseEffectHeader}, which mounts this).
 *
 * The branches come from the legal moves rather than from the effect, because they are not always
 * both offered: a gain that would give nothing is not one of them — a Jungle card the player cannot
 * pay for — and the other side of the slash is then the only thing left to pick.
 *
 * Hence a dialog that only closes when closing leads somewhere: the rules offer nothing but these
 * branches, so closing takes back the action that led here, and the player may play something else
 * instead. An action that revealed something cannot be taken back, and then there is nothing to
 * close onto and no way out but answering.
 */
export const ChooseEffectDialog = () => {
  const { t } = useTranslation()
  const rules = useRules<AurealisRules>()
  const moves = useLegalMoves<CustomMove>(isCustomMoveType(CustomMoveType.ChooseEffect))
  const [undo, canUndo] = useUndo()
  const cancel = canUndo() ? () => undo() : undefined
  const options: Effect[] = rules?.remind<EffectOf<EffectType.Choice> | undefined>(Memory.CurrentEffect)?.options ?? []
  if (!moves.length) return null
  return (
    <Dialog open onBackdropClick={cancel}>
      <div css={content}>
        <h2 css={title}>{t('choose-effect.choose')}</h2>
        {/*
          The gains are written the way the help dialogs of the game write them (see {@link EffectText}),
          which is the same wording the player reads on the card itself. Nothing closes the dialog on a
          branch being played: the rule hands the game over on its own, and an action that asks twice in
          a row keeps it open on the question that follows.
        */}
        <div css={branches}>
          {moves.map((move, index) => (
            <Fragment key={index}>
              {index > 0 && <span css={or}>{t('choose-effect.or')}</span>}
              <PlayMoveButton move={move} css={branchButton}>
                <EffectText effect={options[move.data as number]} />
              </PlayMoveButton>
            </Fragment>
          ))}
        </div>
        {/*
          "Annuler" is the platform's own word, which every game on it shares: taken from the common
          namespace rather than written again here, so that it reads the same in every locale.
        */}
        {cancel !== undefined && (
          <div css={buttons}>
            <ThemeButton css={cancelButton} onClick={cancel}>
              {t('Cancel', { ns: 'common' })}
            </ThemeButton>
          </div>
        )}
      </div>
    </Dialog>
  )
}

/** Colors come from the theme: the Dialog of the framework already applies its background and its text color. */
const content = css`
  padding: 2em 3em;
  max-width: 80em;
`

const title = css`
  margin: 0 0 0.6em;
  text-align: center;
  font-family: ${fontDisplay};
  color: ${colors.canvasLight};
  font-size: 3em;
`

/**
 * A column rather than a row: a gain of this game is a sentence and not a pair of symbols, and two
 * sentences side by side are read one against the other rather than one after the other.
 */
const branches = css`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.6em;
`

const or = css`
  align-self: center;
  font-size: 2.2em;
  font-style: italic;
  color: ${colors.canvas};
`

/**
 * The branches are cut to one width rather than to the words each holds: they are the faces of one
 * choice, and one of them being wider than the others would read as one of them mattering more.
 */
const branchButton = css`
  font-size: 2.4em;
  line-height: 1.35;
  text-align: center;
  padding: 0.6em 1em !important;
`

const buttons = css`
  display: flex;
  justify-content: center;
  margin-top: 1.2em;
`

/**
 * Read as an answer to the question above it and not as a footnote to it, hence a size of its own:
 * this one is the way out of a choice the player did not mean to open.
 */
const cancelButton = css`
  font-size: 2.2em;
  padding: 0.3em 1.4em !important;
`
