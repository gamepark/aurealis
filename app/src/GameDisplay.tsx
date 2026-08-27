import { pointerWithin } from '@dnd-kit/core'
import { css } from '@emotion/react'
import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { DevToolsHub, GameTable, GameTableNavigation, useRules } from '@gamepark/react-game'
import { COMMON_AREA_RIGHT, TABLE_HEIGHT, TABLE_LEFT, tableRight } from './locators/TableLayout'
import { PlayerPanels } from './panels/PlayerPanels'
import { colors } from './theme/colors'

/**
 * The table is as small as the material allows, so that on a phone every card is as big as it can
 * be. Its shape is close to 16:9 once the 7 cm kept above it are counted: on such a screen it is the
 * width that limits the material, and there is no room left unused around it.
 *
 * The player panels are laid over the empty left end of the rows along the edges of the table, which
 * is why no margin is kept for them.
 *
 * The one thing that can make it grow is a jungle longer than the 6 cards it was drawn for. It then
 * grows to the right and to the right only: every other coordinate of the game is absolute, so the
 * common area stays exactly where it is and the material simply loses a little size — which is why
 * the table is not given that width from the start, for a length few games will ever reach.
 */
export function GameDisplay() {
  const margin = { top: 7, left: 0, right: 0, bottom: 0 }
  const xMax = useTableRight()
  return (
    <>
      <GameTable
        xMin={TABLE_LEFT}
        xMax={xMax}
        yMin={-TABLE_HEIGHT / 2}
        yMax={TABLE_HEIGHT / 2}
        margin={margin}
        collisionAlgorithm={pointerWithin}
        css={process.env.NODE_ENV === 'development' && tableBorder}
      >
        <GameTableNavigation css={navigationCss} />
        <PlayerPanels />
        {process.env.NODE_ENV === 'development' && <DevToolsHub fabBottom="calc(5em)" />}
      </GameTable>
    </>
  )
}

/** Where the table stops on the right, which the material asks too when it grows under the pointer. */
function useTableRight(): number {
  const rules = useRules<AurealisRules>()
  return rules ? tableRight(rules) : COMMON_AREA_RIGHT
}

const tableBorder = css`
  border: 1px solid white;
`

/**
 * The two zoom buttons, taken off the left edge of the screen and hung under the menu instead.
 *
 * The top right corner is where everything that is not the game itself already lives: the menu
 * button, and the buttons that slide out from under it towards the left — undo, full screen. Zooming
 * belongs with them, and it is given their shape rather than one of its own: the same 2.5 em column
 * against the right edge, the same parchment on jungle green, and the bottom corner rounded off the
 * way the menu button's is. One block of chrome in one corner, and the table left clear everywhere
 * else.
 *
 * The font size is the menu's own, so that "2.5 em" here is the very 2.5 em the menu button is wide.
 */
const navigationCss = css`
  font-size: calc(3.2em * var(--gp-scale));
  flex-direction: column;
  top: 2.5em;
  left: auto;
  right: 0;
  z-index: 990;
  gap: 0;
  transform: none;
  overflow: hidden;
  border-bottom-left-radius: 0.5em;
  box-shadow: 0 0 0.2em black;

  /* The shape of a pop button — 2.5 by 2.25 — at four fifths of its size: zooming is the smallest
     thing this corner does, and it should not hang under the menu weighing more than the menu. */
  > button {
    font-size: 0.8em;
    width: 2.5em;
    height: 2.25em;
    padding: 0;
    border: none;
    border-radius: 0;
    background: ${colors.parchment};
    color: ${colors.jungle};
    filter: none;
    transition: background 150ms ease;

    &:not(:disabled) {
      &:focus,
      &:hover {
        background: ${colors.canvasLight};
        transform: none;
      }

      &:active {
        background: ${colors.canvas};
        transform: none;
      }
    }

    /* Greyed rather than faded: an opacity here would let the table show through the button. */
    &:disabled {
      background: ${colors.parchment};
      color: rgba(36, 59, 33, 0.3);
    }
  }

  > button + button {
    border-top: 0.05em solid rgba(36, 59, 33, 0.25);
  }
`
