import { css } from '@emotion/react'
import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { Dialog, MaterialComponent, PlayMoveButton, useLegalMoves, usePlay, useRules } from '@gamepark/react-game'
import { isMoveItem, isMoveItemType, MaterialMove, MaterialMoveBuilder } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'
import { colors } from '../theme/colors'
import { fontDisplay } from '../theme/typography'

const displayMaterialHelp = MaterialMoveBuilder.displayMaterialHelp

/**
 * The one Temple tile that reaches past the market, for one of the 3 cards at the *bottom* of the
 * Jungle deck (rulebook p.12, see {@link AcquireJungleRule}).
 *
 * Those 3 cards are buried under the whole pile on the table, where nothing can be pointed at: the
 * deck is drawn as one card thick with the rest of it 0.5 mm apart behind it (see {@link StackLocator}),
 * so the buttons the market cards carry have nowhere to stand. Hence the choice is made here instead,
 * with the 3 cards laid out side by side and face up, each with a button of its own underneath —
 * the same two clicks as buying from the market, in a place where they fit.
 *
 * A card in here answers the pointer the way a card on the table does: pressing it opens its help
 * (see {@link JungleCardHelp}), which is what tells the three of them apart — what each one is worth
 * is written there and nowhere else, and the choice cannot be made without reading it.
 */
export const DeckBottomJungleDialog = () => {
  const { t } = useTranslation()
  const rules = useRules<AurealisRules>()
  const play = usePlay()
  const moves = useLegalMoves<MaterialMove>(isMoveItemType(MaterialType.JungleCard))
  if (!rules || !moves.length) return null
  return (
    <Dialog open>
      <div css={content}>
        <h2 css={title}>{t('deck-bottom.choose')}</h2>
        <p css={intro}>{t('deck-bottom.intro')}</p>
        {/*
          In the order the rules offer them, which is the order they lie in: the very bottom card
          first. Their id is read off the material, since a move only names the place the card is at.
        */}
        <div css={cards}>
          {moves.map((move, index) => {
            const itemIndex = isMoveItem(move) ? move.itemIndex : 0
            const item = rules.material(MaterialType.JungleCard).getItem(itemIndex)
            return (
              <div key={index} css={column}>
                {/*
                  The help is opened as a local move, exactly as the framework opens it from the table
                  (see {@link MaterialDescription.displayHelp}): the dialog it puts up is portalled
                  after this one and covers it, and closing it comes back here with the choice intact.
                */}
                <MaterialComponent
                  type={MaterialType.JungleCard}
                  itemId={item?.id}
                  css={card}
                  onClick={() => play(displayMaterialHelp(MaterialType.JungleCard, item, itemIndex), { local: true })}
                />
                <PlayMoveButton move={move} css={pickButton}>
                  {t('deck-bottom.pick')}
                </PlayMoveButton>
              </div>
            )
          })}
        </div>
      </div>
    </Dialog>
  )
}

/** Colors come from the theme: the Dialog of the framework already applies its background and its text color. */
const content = css`
  padding: 2em 3em;
`

const title = css`
  margin: 0 0 0.3em;
  text-align: center;
  font-family: ${fontDisplay};
  color: ${colors.canvasLight};
  font-size: 3em;
`

const intro = css`
  margin: 0 0 1em;
  text-align: center;
  font-size: 1.8em;
  font-style: italic;
  color: ${colors.canvas};
`

const cards = css`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 1.5em;
`

/**
 * A column per card: the card itself, and the button that takes it, cut to the width of the card —
 * a button wider than what it acts on reads as a button for the row rather than for the card.
 * 6.3 cm of card at the size {@link card} draws it, said in the em of this column.
 */
const column = css`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.8em;
  width: 22.68em;
`

/**
 * A Jungle card is 6.3 x 8.8 cm and {@link MaterialComponent} draws it that many em, so the font size
 * is what sizes it. Bigger than on the table, because the dialog is where the three of them are read
 * against one another and the pointer cannot blow them up in here (see {@link zoomOnHover}) — and
 * three of them at this size still leave the table showing on either side.
 *
 * The pointer says it is a card that answers: it opens the card's help, the same as pressing a card
 * on the table.
 */
const card = css`
  font-size: 3.6em;
  cursor: pointer;
`

const pickButton = css`
  font-size: 2em;
  padding: 0.3em 0.5em !important;
`
