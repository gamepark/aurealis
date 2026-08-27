/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { ItemButtonProps, ItemMenuButton } from '@gamepark/react-game'
import { HTMLAttributes, ReactNode } from 'react'
import { colors } from './colors'
import { fontDisplay } from './typography'

type Props = ItemButtonProps &
  HTMLAttributes<HTMLButtonElement> & {
    children?: ReactNode
    /** Marks the one power a Camp de base has improved, and the Archaeologist already picked: what the
     * player's eye has to come back to. The disc turns to the gold the game is named after. */
    highlight?: boolean
  }

/**
 * The buttons laid over the material itself. Same shape as the {@link theme} buttons — jungle green,
 * gold rim, parchment glyph — but round and floating above the card they act on.
 */
export const AurealisMenuButton = ({ highlight, ...props }: Props) => (
  <ItemMenuButton css={[menuButtonCss, highlight && highlightButtonCss]} {...props} />
)

const menuButtonCss = css`
  width: 2.2em;
  height: 2.2em;
  border-radius: 50%;
  background: ${colors.jungle};
  border: 0.12em solid ${colors.gold};
  color: ${colors.parchment};
  box-shadow:
    0 0.15em 0.4em rgba(0, 0, 0, 0.5),
    inset 0 0.08em 0.12em rgba(255, 255, 255, 0.1);
  transition:
    background 150ms ease,
    border-color 150ms ease,
    box-shadow 150ms ease,
    margin-top 150ms ease;

  &:hover:not(:disabled) {
    background: ${colors.jungleLight};
    border-color: ${colors.goldLight};
    color: ${colors.canvasLight};
    margin-top: -0.12em;
    box-shadow: 0 0.25em 0.5em rgba(0, 0, 0, 0.5);
  }

  &:disabled {
    background: #555;
    border-color: #444;
    color: #999;
    cursor: default;
  }

  > span {
    font-size: 0.82em;
    font-family: ${fontDisplay};
    font-weight: 700;
    color: ${colors.parchment};
    background: ${colors.jungleDeep};
    border: 0.1em solid ${colors.gold};
    border-radius: 0.35em;
    padding: 0.25em 0.6em;
    box-shadow: 0 0.12em 0.35em rgba(0, 0, 0, 0.6);
    white-space: nowrap;
    letter-spacing: 0.02em;
  }
`

const highlightButtonCss = css`
  background: ${colors.gold};
  border-color: ${colors.goldLight};
  color: ${colors.jungleDeep};

  &:hover:not(:disabled) {
    background: ${colors.goldLight};
    border-color: ${colors.canvasLight};
    color: ${colors.jungleDeep};
  }
`
