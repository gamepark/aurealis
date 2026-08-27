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
  display: block;
  font-family: ${fontDisplay};
  font-size: 0.88em;
  color: ${colors.canvas};
  margin-bottom: 0.15em;
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
