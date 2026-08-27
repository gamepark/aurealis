/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { Adventurer, AdventurerId } from '@gamepark/aurealis/material/Adventurer'
import { adventurerLines, getPlayableLine } from '@gamepark/aurealis/material/AdventurerLines'
import { getCardsInPlay } from '@gamepark/aurealis/material/CardsInPlay'
import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { usePlayerId, useRules } from '@gamepark/react-game'
import { FC } from 'react'
import { colors } from '../theme/colors'

/**
 * The one line of an Adventurer card that would apply if it were played now, framed on the card
 * itself.
 *
 * A card carries up to 3 lines and only the most powerful one whose condition is met is applied
 * (rulebook p.6). Which one that is takes counting the two stands and the river — the one thing the
 * card cannot tell its owner by itself — and the help dialog already answers it in words
 * (see {@link AdventurerCardHelp}). The frame says the same thing without opening anything: a hand
 * of 5 is read at a glance, and what each card is *worth* is half of that reading.
 *
 * Only on the reader's own stand: elsewhere the fronts are hidden anyway, and a condition is read on
 * the hand the card belongs to.
 */
export const PlayableLineFrame: FC<{ itemId?: AdventurerId; itemIndex?: number }> = ({ itemId, itemIndex }) => {
  const rules = useRules<AurealisRules>()
  const player = usePlayerId<number>()
  const front = itemId?.front as Adventurer | undefined
  if (!rules || front === undefined || itemIndex === undefined || player === undefined) return null
  const item = rules.material(MaterialType.AdventurerCard).getItem(itemIndex)
  if (item?.location.type !== LocationType.PlayerHand || item.location.player !== player) return null
  const opponent = rules.players.find((other) => other !== player)
  if (opponent === undefined) return null
  const lines = adventurerLines[front]
  const playable = getPlayableLine(front, getCardsInPlay(rules, player, opponent))
  // No line met: the card gives nothing at all, and there is nothing to point at.
  if (playable === undefined) return null
  const index = lines.indexOf(playable)
  const height = (PANEL_BOTTOM - panelTop(lines.length)) / lines.length
  return <div css={frameCss(panelTop(lines.length) + index * height, height)} />
}

/**
 * Where the effect panel — the wooden plank on the right of a card — sits, in centimetres from the
 * top left corner of a card 4.4 x 7 cm.
 *
 * Measured off the artwork (520 x 827 px, identical on all 52 cards): the plank runs from x 264 to
 * x 481 and ends at y 700, and its top is y 502, except on the cards carrying 3 lines where it is
 * raised to y 455 to make room. Its lines share its height evenly, which places every icon of every
 * card inside its own band.
 */
const cm = (pixels: number, imageSize: number, cardSize: number) => (pixels / imageSize) * cardSize
const x = (pixels: number) => cm(pixels, 520, 4.4)
const y = (pixels: number) => cm(pixels, 827, 7)

const PANEL_LEFT = x(264)
const PANEL_WIDTH = x(481 - 264)
const PANEL_BOTTOM = y(700)
const panelTop = (lines: number) => y(lines === 3 ? 455 : 502)

/**
 * How far the frame stands outside the plank on each side. The stroke is drawn inside the rectangle,
 * so a thicker one closes in on what is printed: the rectangle is given that width back, and the
 * icons keep the room the card gives them. Sideways only — two lines of the same card are one band
 * under the other, and a frame growing downwards would climb onto its neighbour.
 */
const FRAME_BLEED = 0.06

/**
 * A frame, and nothing else: what is printed inside it has to stay as readable as it is on the card.
 * The sunlit green of the jungle, which the interface already uses for its buttons, over a dark halo
 * that keeps the line drawn against the wood of the plank.
 */
const frameCss = (top: number, height: number) => css`
  position: absolute;
  left: ${PANEL_LEFT - FRAME_BLEED}em;
  top: ${top + 0.03}em;
  width: ${PANEL_WIDTH + 2 * FRAME_BLEED}em;
  height: ${height - 0.06}em;
  box-sizing: border-box;
  border: 0.1em solid ${colors.jungleLight};
  border-radius: 0.22em;
  box-shadow:
    0 0 0.08em rgba(0, 0, 0, 0.55),
    inset 0 0 0.08em rgba(0, 0, 0, 0.45);
  pointer-events: none;
`
