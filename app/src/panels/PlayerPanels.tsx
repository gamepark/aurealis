import { css } from '@emotion/react'
import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { TILES_TO_WIN } from '@gamepark/aurealis/Constants'
import { playerGold } from '@gamepark/aurealis/material/Coin'
import { countPlayerTiles } from '@gamepark/aurealis/material/PlayerTiles'
import { StyledPlayerPanel, usePlayers, useRules } from '@gamepark/react-game'
import { createPortal } from 'react-dom'
import instantVictory from '../images/tiles/InstantVictory.jpg'
import coin from '../images/tokens/Coin1.png'

/**
 * Each panel sits at the left end of its owner's row of cards, in the space left empty for it there:
 * mine along the bottom edge of the table, my opponent's along the top one.
 *
 * Two counters under the name, and no more: the two numbers a player has to keep on the opponent as
 * well as on themselves. What is on the table is read off the table — the jungle is a row of cards,
 * the team is a heap of pawns — but gold is a scattered handful and the tiles won are a line that
 * has to be counted before it means anything.
 */
export const PlayerPanels = () => {
  const players = usePlayers<number>({ sortFromMe: true })
  const rules = useRules<AurealisRules>()
  const root = document.getElementById('root')
  if (!root || !rules) {
    return null
  }

  return createPortal(
    <>
      {players.map((player, index) => (
        <StyledPlayerPanel
          key={player.id}
          player={player}
          counters={[
            { image: coin, value: playerGold(rules, player.id) },
            // Out of 7, because the number on its own says nothing: what matters is how close to the
            // end of the game it is, and that is the whole point of counting the tiles at all.
            { image: instantVictory, value: `${countPlayerTiles(rules, player.id)}/${TILES_TO_WIN}`, imageCss: tileCounterImage }
          ]}
          css={panelPosition(index)}
          activeRing
        />
      ))}
    </>,
    root
  )
}

/** The coin beside it is a disc: the square tile is rounded off so the two counters read as a pair. */
const tileCounterImage = css`
  border-radius: 15%;
`

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
