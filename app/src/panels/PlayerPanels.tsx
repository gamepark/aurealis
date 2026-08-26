import { css } from '@emotion/react'
import { StyledPlayerPanel, usePlayers } from '@gamepark/react-game'
import { createPortal } from 'react-dom'

/**
 * Each panel sits at the left end of its owner's row of cards, in the space left empty for it there:
 * mine along the bottom edge of the table, my opponent's along the top one.
 */
export const PlayerPanels = () => {
  const players = usePlayers<number>({ sortFromMe: true })
  const root = document.getElementById('root')
  if (!root) {
    return null
  }

  return createPortal(
    <>
      {players.map((player, index) => (
        <StyledPlayerPanel key={player.id} player={player} css={panelPosition(index)} activeRing />
      ))}
    </>,
    root
  )
}

const panelPosition = (index: number) =>
  index === 0
    ? css`
        position: absolute;
        left: 2em;
        bottom: 2em;
        width: 28em;
      `
    : css`
        position: absolute;
        left: 2em;
        top: 9em;
        width: 28em;
      `
