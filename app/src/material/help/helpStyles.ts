import { css } from '@emotion/react'
import { colors } from '../../theme/colors'
import { fontDisplay } from '../../theme/typography'

/**
 * The one look every help dialog wears. They open over the game's own dark green (see the theme's
 * `dialog`), so nothing here paints a background of its own: the text is parchment on canopy, and
 * gold is what marks out a heading or the edge of a block.
 *
 * Four shapes and no more, because every dialog says the same four kinds of thing: what the item is,
 * what it is worth, what it does, and where it currently sits.
 */

/** The name of the item, at the top of the dialog. */
export const helpTitle = css`
  font-family: ${fontDisplay};
  color: ${colors.canvasLight};
  margin: 0 0 0.4em 0 !important;
  padding: 0 0 0.25em 0;
  border-bottom: 0.1em solid ${colors.gold};
  text-align: left !important;
`

/** What the item is, in a sentence or two, right under the title. */
export const helpIntro = css`
  font-size: 0.95em;
  line-height: 1.5;
  color: ${colors.parchment};
  margin: 0 0 1em 0;

  strong,
  b {
    color: ${colors.goldLight};
    font-weight: 600;
  }
`

/** A heading over a block, with the gold rule that trails off to the right. */
export const helpSection = css`
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-family: ${fontDisplay};
  font-size: 0.75em;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${colors.canvas};
  margin: 1em 0 0.4em 0 !important;

  &::after {
    content: '';
    flex: 1;
    height: 0.1em;
    background: linear-gradient(90deg, ${colors.gold} 0%, rgba(189, 133, 44, 0.2) 60%, transparent 100%);
  }
`

/** What the item gives, or asks for: the body of a dialog. */
export const helpBlock = css`
  font-size: 0.92em;
  line-height: 1.55;
  color: ${colors.parchment};
  padding: 0.4em 0.7em;
  margin: 0 0 0.6em 0;
  background: rgba(246, 239, 221, 0.06);
  border-left: 0.25em solid ${colors.gold};
  border-radius: 0 0.3em 0.3em 0;

  strong,
  b {
    color: ${colors.goldLight};
    font-weight: 600;
  }

  ul {
    margin: 0;
    padding-left: 1.1em;
  }

  li + li {
    margin-top: 0.3em;
  }
`

/**
 * The one line of a card that is worth something right now, among the two or three it carries: the
 * conditions are read from the easiest down, and only the last one met is applied (rulebook p.6).
 */
export const helpBlockActive = css`
  border-left-color: ${colors.goldLight};
  background: rgba(226, 167, 29, 0.16);
`

/** A line that cannot be used as things stand, kept legible but plainly out of play. */
export const helpBlockUnmet = css`
  opacity: 0.55;
`

/** The condition a gain is subject to, over the gain itself. */
export const helpCondition = css`
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-family: ${fontDisplay};
  font-size: 0.88em;
  color: ${colors.canvas};
  margin-bottom: 0.15em;
`

/**
 * A line of a help dialog set the way the rulebook sets its iconography (p.12): the icons of the box
 * on the left, the sentence that reads them out on the right.
 *
 * A sentence is what a player reads once; the icon is what they will meet again on the card, on a
 * Jungle bonus and on a Temple tile, since the box draws the very same gain the same way in all
 * three places. So the drawing leads, and it keeps its own column however long the words run.
 */
export const helpIconRow = css`
  display: flex;
  align-items: center;
  gap: 0.5em;

  & + & {
    margin-top: 0.35em;
  }
`

/** The icons of one condition or one gain, kept together: a type and the arrows that qualify it. */
export const helpIcons = css`
  display: flex;
  align-items: center;
  gap: 0.15em;
  flex: none;
`

/**
 * Two lines of text tall: enough for the digit printed inside an icon to be read, and not so much
 * that a gain of one line towers over the sentence beside it.
 */
export const helpIcon = css`
  height: 2.2em;
  width: auto;
`

/**
 * The verdict on a condition, right before the words that state it: met, or not met, as the table
 * stands. The block behind it already says as much — the line that applies is picked out in gold and
 * the others are dimmed — but that is a difference between blocks, and it is only read by comparing
 * them. A mark is read on the line itself.
 *
 * Only ever shown for a card whose conditions can be counted at all, which is a card on the reader's
 * own stand (see {@link AdventurerCardHelp}). Elsewhere the lines are given plain.
 *
 * The green of the jungle in full sun for what holds, the terracotta of the pots — the game's one
 * alert colour — for what does not. The lighter terracotta on purpose: a line whose condition fails
 * is dimmed as a whole, and the mark has to survive that.
 */
export const helpConditionMark = (met: boolean) => css`
  flex: none;
  color: ${met ? colors.jungleLight : colors.clayLight};
`

/** Where the item stands at the moment, at the foot of the dialog. */
export const helpLocation = css`
  font-size: 0.82em;
  font-style: italic;
  color: ${colors.canvas};
  margin: 1em 0 0 0;
  padding-top: 0.5em;
  border-top: 0.06em dashed rgba(229, 192, 104, 0.35);
`
