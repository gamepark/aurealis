import { css } from '@emotion/react'
import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { TILES_TO_WIN } from '@gamepark/aurealis/Constants'
import { BaseCamp, playerBaseCamp } from '@gamepark/aurealis/material/BaseCamp'
import { playerGold } from '@gamepark/aurealis/material/Coin'
import { countPlayerTiles } from '@gamepark/aurealis/material/PlayerTiles'
import { StyledPlayerPanel, usePlayers, useRules } from '@gamepark/react-game'
import {
  PLAYER_PANEL_BOTTOM,
  PLAYER_PANEL_EM_WIDTH,
  PLAYER_PANEL_WIDTH,
  PLAYER_PANEL_X,
  PLAYER_PANEL_Z,
  TABLE_HEIGHT,
  TABLE_LEFT
} from '../locators/TableLayout'
import { campColors } from '../theme/colors'
import instantVictory from '../images/tiles/InstantVictory.jpg'
import coin from '../images/tokens/Coin1.png'

/**
 * Each panel is laid on the table, at the left end of its owner's band and in the colour of their
 * Camp de base: mine along the bottom edge, my opponent's along the top one. On the table and not
 * over it — it is a piece of the player's area like the hand or the gold beside it, so it is panned,
 * zoomed and reflected with everything else rather than pinned to a corner of the screen.
 *
 * Two counters under the name, and no more: the two numbers a player has to keep on the opponent as
 * well as on themselves. What is on the table is read off the table — the jungle is a row of cards,
 * the team is a heap of pawns — but gold is a scattered handful and the tiles won are a line that
 * has to be counted before it means anything.
 */
export const PlayerPanels = () => {
  const players = usePlayers<number>({ sortFromMe: true })
  const rules = useRules<AurealisRules>()
  if (!rules) return null

  return (
    <>
      {players.map((player, index) => (
        <div key={player.id} css={panelPlace(index === 0)}>
          <StyledPlayerPanel
            player={player}
            counters={[
              { image: coin, value: playerGold(rules, player.id) },
              // Out of 7, because the number on its own says nothing: what matters is how close to the
              // end of the game it is, and that is the whole point of counting the tiles at all.
              { image: instantVictory, value: `${countPlayerTiles(rules, player.id)}/${TILES_TO_WIN}`, imageCss: tileCounterImage }
            ]}
            css={[panelSize, campPanel(playerBaseCamp(rules, player.id))]}
            activeRing
          />
        </div>
      ))}
    </>
  )
}

/** The coin beside it is a disc: the square tile is rounded off so the two counters read as a pair. */
const tileCounterImage = css`
  border-radius: 15%;
`

/**
 * Where the panel is nailed to the table, in the centimetres of the table's own coordinates: the
 * near player's along the bottom edge, the far player's along the top one, reflected exactly as
 * every other piece of their area is (see {@link playerSide}).
 *
 * Both are anchored by the edge they lie against, which for the near player means its bottom — hence
 * the shift of its own height, the only measure of the panel this file does not decide.
 */
const panelPlace = (near: boolean) => css`
  position: absolute;
  left: ${PLAYER_PANEL_X - TABLE_LEFT}em;
  top: ${(near ? PLAYER_PANEL_BOTTOM : -PLAYER_PANEL_BOTTOM) + TABLE_HEIGHT / 2}em;
  transform: translate3d(0, ${near ? -100 : 0}%, ${PLAYER_PANEL_Z}em);
  transform-style: preserve-3d;
`

/**
 * What turns the panel's own em into centimetres of table. It carries every measure of the panel —
 * its 28 em of width, the size of the name, of the timer and of the counters — so setting it is the
 * whole of sizing the panel.
 */
const panelSize = css`
  font-size: ${PLAYER_PANEL_WIDTH / PLAYER_PANEL_EM_WIDTH}em;
`

/**
 * The player's colour, and the only one they have: the Camp de base cards are cosmetic variants, so
 * the tents a player was dealt are what tells their side of the table from the other (see
 * {@link campColors}).
 *
 * Light where the rest of the interface is dark, because the panel is no longer part of the
 * interface: it now lies among the cards, and it should read as one more piece of material rather
 * than as a window laid over them. The name, the timer and the counters are dark badges, so they
 * stand out on it exactly as they stood out on the dark panel it replaces.
 *
 * The ring that marks the player to move is turned to the same colour, so that whose turn it is and
 * whose panel it is are said by one thing rather than two.
 */
const campPanel = (camp = BaseCamp.BaseCamp1) => {
  const { main, deep, light } = campColors[camp]
  return css`
    background: linear-gradient(160deg, ${light} 0%, ${main} 100%);
    border: 0.15em solid ${deep};
    --gp-ring-color-1: ${light};
    --gp-ring-color-2: ${deep};
  `
}
