/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ItemButtonProps } from '@gamepark/react-game'
import { MaterialMove } from '@gamepark/rules-api'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AurealisMenuButton } from './AurealisMenuButton'

/** One thing a player may do to the item the buttons are laid over. */
export type ItemMenuAction = {
  /** The move the button plays. */
  move: MaterialMove
  /** Left on the player's own screen for {@link CustomMoveType.SelectArchaeologist}, unset otherwise. */
  options?: ItemButtonProps['options']
  icon: IconDefinition
  /**
   * Degrees clockwise the glyph is turned by, for the ones that stand away from what they act on: a
   * chevron is only a direction, and it has to be aimed at the thing the button is about.
   */
  rotation?: number
  /** Where this one button stands, from the middle of the item, in centimetres. Overrides the row. */
  x?: number
  y?: number
  /** Translation key of the tooltip: the icon says what the button does, this says it in words. */
  title: string
  /** Shown beside the disc, for the one figure a button cannot draw — an amount of gold. */
  label?: ReactNode
  highlight?: boolean
}

type Props = {
  actions: ItemMenuAction[]
  /** Where the row sits on the item, from its middle, in centimetres. Unused when every button places itself. */
  y?: number
  /** Distance between two buttons of the row. */
  step?: number
}

/**
 * A row of buttons over an item, centred on it: one button, and it is in the middle of the card; two,
 * and they part left and right of it. Which is what makes a pair of them read as a direction — the
 * two Archaeologist moves of a Jungle card are laid out by nothing else.
 *
 * An action giving its own x and y steps out of the row: what is printed on a card is not laid out
 * evenly, and a button pointing at one printed thing has to stand where that thing is.
 */
export const ItemMenuActions = ({ actions, y = 0, step = 2.4 }: Props) => {
  const { t } = useTranslation()
  // The row is made of the buttons that did not place themselves: one standing apart must not shift
  // the others off the middle of the item, which is what makes a lone button read as "this card".
  const row = actions.filter((action) => action.x === undefined)
  return (
    <>
      {actions.map((action, index) => (
        <AurealisMenuButton
          key={index}
          x={action.x ?? (row.indexOf(action) - (row.length - 1) / 2) * step}
          y={action.y ?? y}
          move={action.move}
          options={action.options}
          label={action.label}
          highlight={action.highlight}
          title={t(action.title)!}
        >
          <FontAwesomeIcon icon={action.icon} css={action.rotation !== undefined && rotated(action.rotation)} />
        </AurealisMenuButton>
      ))}
    </>
  )
}

const rotated = (degrees: number) => css`
  transform: rotate(${degrees}deg);
`
