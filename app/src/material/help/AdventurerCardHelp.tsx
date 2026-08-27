import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { Adventurer, AdventurerId, getBackMainType, getBackSecondaryType } from '@gamepark/aurealis/material/Adventurer'
import { adventurerLines, getLineEffects, getPlayableLine } from '@gamepark/aurealis/material/AdventurerLines'
import { getCardsInPlay } from '@gamepark/aurealis/material/CardsInPlay'
import { CardsInPlay, meetsCondition, noCards } from '@gamepark/aurealis/material/Condition'
import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck'
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MaterialHelpProps, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Effects } from './EffectDescription'
import { ConditionText } from './ConditionDescription'
import { helpBlock, helpBlockActive, helpBlockUnmet, helpCondition, helpConditionMark, helpIntro, helpLocation, helpSection, helpTitle } from './helpStyles'

/**
 * An Adventurer card: its two types, and the 1 to 3 lines printed on it.
 *
 * The lines are the whole card, so they are given in the order they are printed — easiest condition
 * first, and the gain growing with it — and the one that would apply right now is picked out, since
 * only the most powerful line met is applied (rulebook p.6). That is the one thing a player cannot
 * work out at a glance: it takes counting the two stands and the river.
 *
 * A card whose front is hidden shows its back, which still names both of its types: that is what the
 * opponent reads off the stand and off the river, and what every condition of the game counts.
 */
export const AdventurerCardHelp: FC<MaterialHelpProps> = ({ item }) => {
  const { t } = useTranslation()
  const rules = useRules<AurealisRules>()
  const id = item.id as AdventurerId | undefined
  if (!rules || !id) return null
  const front = id.front as Adventurer | undefined
  // Both types come off the back, which is never hidden: it is what the opponent reads across the
  // table, and a card whose front is out of reach still names them.
  const mainType = getBackMainType(id.back)
  const secondaryType = getBackSecondaryType(id.back)
  return (
    <>
      <h2 css={helpTitle}>{t(front !== undefined ? 'help.adventurer.title' : 'help.adventurer.title.hidden', { adventurer: t(`adventurer.${mainType}`) })}</h2>
      <p css={helpIntro}>
        <Trans i18nKey="help.adventurer.types" values={{ main: t(`adventurer.${mainType}`), secondary: t(`adventurer.${secondaryType}`) }}>
          <strong />
          <strong />
        </Trans>
      </p>
      {front !== undefined ? <AdventurerLines card={front} item={item} /> : <p css={helpBlock}>{t('help.adventurer.hidden')}</p>}
      <AdventurerCardLocation item={item} />
    </>
  )
}

/**
 * The lines of the card, and which of them is worth something as the table stands.
 *
 * Only ever answered for a card on the reader's own stand: a condition is read on the hand the card
 * belongs to, and the hand it belongs to is the only one whose fronts that reader can see anyway.
 * Elsewhere the lines are given plain, which is what the card itself says.
 */
const AdventurerLines: FC<{ card: Adventurer } & Pick<MaterialHelpProps, 'item'>> = ({ card, item }) => {
  const { t } = useTranslation()
  const rules = useRules<AurealisRules>()!
  const player = usePlayerId<number>()
  const owner = item.location?.player
  const inMyHand = item.location?.type === LocationType.PlayerHand && owner !== undefined && owner === player
  const cards: CardsInPlay | undefined = inMyHand
    ? getCardsInPlay(rules, owner, rules.players.find((other) => other !== owner)!)
    : undefined
  const playable = cards && getPlayableLine(card, cards)
  const lines = adventurerLines[card]
  return (
    <>
      <div css={helpSection}>{t('help.adventurer.lines')}</div>
      {lines.map((line, index) => {
        const met = cards && meetsCondition(line.condition, cards)
        return (
          <div key={index} css={[helpBlock, line === playable && helpBlockActive, met === false && helpBlockUnmet]}>
            <span css={helpCondition}>
              {met !== undefined && <FontAwesomeIcon icon={met ? faCheck : faXmark} css={helpConditionMark(met)} />}
              <ConditionText condition={line.condition} />
            </span>
            {/* The lines that scale with the game are given their real value whenever it is known,
                and the "?" of the card is then a number the player can act on. */}
            <Effects effects={getLineEffects(line, cards ?? EMPTY_TABLE)} />
          </div>
        )
      })}
      {lines.length > 1 && <p css={helpIntro}>{t('help.adventurer.best-line')}</p>}
      {playable === undefined && cards !== undefined && <p css={helpIntro}>{t('help.adventurer.unplayable')}</p>}
    </>
  )
}

/**
 * An empty table, for the few cards whose gain is worth the number of cards of a type in play: read
 * from anywhere but the reader's own stand they have no number to show, and 0 is the honest one —
 * the sentence then reads "pour chaque carte X en jeu", which is what the card itself says.
 */
const EMPTY_TABLE: CardsInPlay = { hand: noCards(), opponent: noCards(), river: noCards() }

/** Where the card stands, which is what says whether its front can be read at all. */
const AdventurerCardLocation: FC<Pick<MaterialHelpProps, 'item'>> = ({ item }) => {
  const player = usePlayerId<number>()
  const name = usePlayerName(item.location?.player)
  const mine = item.location?.player !== undefined && item.location.player === player
  switch (item.location?.type) {
    case LocationType.PlayerHand:
      return (
        <p css={helpLocation}>
          <Trans i18nKey={mine ? 'help.adventurer.in-my-hand' : 'help.adventurer.in-hand'} values={{ player: name }} />
          {/* Rotated on a stand means face down: just drawn, and not yet turned over. */}
          {!!item.location.rotation && <Trans i18nKey={mine ? 'help.adventurer.face-down.mine' : 'help.adventurer.face-down'} values={{ player: name }} />}
        </p>
      )
    case LocationType.AdventurerRiver:
    case LocationType.AdventurerDeck:
      return <p css={helpLocation}>{<Trans i18nKey="help.adventurer.in-river" />}</p>
    case LocationType.AdventurerDiscard:
      return <p css={helpLocation}>{<Trans i18nKey="help.adventurer.in-discard" />}</p>
    default:
      return null
  }
}
