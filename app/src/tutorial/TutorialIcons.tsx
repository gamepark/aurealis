import { css } from '@emotion/react'
import { Picture } from '@gamepark/react-game'
import archaeologistIcon from '../images/icons/Archaeologist.png'
import expeditionLeaderIcon from '../images/icons/ExpeditionLeader.png'
import explorerIcon from '../images/icons/Explorer.png'
import naturalistIcon from '../images/icons/Naturalist.png'
import animalPawn from '../images/pawns/Animal.png'
import archaeologistPawn from '../images/pawns/Archaeologist.png'
import coin from '../images/tokens/Coin1.png'

/**
 * The icons the tutorial drops inside its sentences, as `<gold/>`-style tags of a `<Trans>`.
 *
 * Two families, and they are not the same thing:
 *
 * - the 4 **type** icons, the diamonds the rulebook prints beside each kind of Adventurer (p.4).
 *   They are taken from the rulebook itself, which draws them 48 pixels wide: enough to read at the
 *   size of a word, and to be replaced the day the box art is exported.
 * - the **material** icons, which are the very images the table is drawn with — a coin, an Animal
 *   pawn, an Archaeologist pawn. A sentence that names a piece shows the piece the reader is looking
 *   at, not a second drawing of it.
 */

/** A word-sized icon: it sits on the line of text rather than beside it. */
const inlineIcon = css`
  display: inline-block;
  height: 1.15em;
  width: auto;
  vertical-align: -0.22em;
  margin: 0 0.06em;
`

/** The 4 type diamonds run a little larger: they are read as symbols, not as pieces. */
const typeIcon = css`
  display: inline-block;
  height: 1.5em;
  width: auto;
  vertical-align: -0.4em;
  margin: 0 0.08em;
`

/** `<strong>` and `<em>`, so that a translation may emphasise without knowing what it is inside. */
export const baseComponents = {
  strong: <strong />,
  b: <strong />,
  em: <em />
}

export const iconComponents = {
  gold: <Picture src={coin} css={inlineIcon} />,
  animal: <Picture src={animalPawn} css={inlineIcon} />,
  archaeologist: <Picture src={archaeologistPawn} css={inlineIcon} />,
  naturalist: <Picture src={naturalistIcon} css={typeIcon} />,
  explorer: <Picture src={explorerIcon} css={typeIcon} />,
  leader: <Picture src={expeditionLeaderIcon} css={typeIcon} />,
  digger: <Picture src={archaeologistIcon} css={typeIcon} />
}

/** Everything a tutorial popup may use: emphasis and icons in one set. */
export const tutorialComponents = { ...baseComponents, ...iconComponents }
