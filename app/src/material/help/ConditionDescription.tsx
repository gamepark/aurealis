import { Condition, ConditionType, Elsewhere } from '@gamepark/aurealis/material/Condition'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'

/**
 * What a line of an Adventurer card asks for, in words (rulebook p.12).
 *
 * Every condition counts cards of one type, and only their *main* type ever counts — which is what
 * makes them countable at all: a card back carries the main type, so the opponent's stand and the
 * river can be read without turning anything over (rulebook p.4).
 *
 * The three places are named rather than implied: "en jeu" is the two stands and the river together,
 * and a card that says "or" and a card that says "and" are one arrow apart on the artwork and worlds
 * apart at the table.
 */
export const ConditionText: FC<{ condition: Condition }> = ({ condition }) => {
  const { t } = useTranslation()
  // The name of the type rather than its value: the sentences read "cartes Naturaliste", and a key
  // built inside the translation file would have to be nested there instead.
  const adventurer = 'adventurer' in condition ? t(`adventurer.${condition.adventurer}`) : undefined
  switch (condition.type) {
    case ConditionType.NoneInHand:
      return <Trans i18nKey="condition.none-in-hand" values={{ adventurer }} />
    case ConditionType.AllTypesInHand:
      return <Trans i18nKey="condition.all-types-in-hand" />
    case ConditionType.MinInHand:
      return <Trans i18nKey="condition.min-in-hand" values={{ adventurer, count: condition.count }} />
    case ConditionType.MinInPlay:
      return <Trans i18nKey="condition.min-in-play" values={{ adventurer, count: condition.count }} />
    case ConditionType.MinElsewhere:
      return <Trans i18nKey={elsewhereKey('condition.min-elsewhere', condition.where)} values={{ adventurer, count: condition.count }} />
    case ConditionType.MoreThan:
      return <Trans i18nKey={elsewhereKey('condition.more-than', condition.where)} values={{ adventurer }} />
    case ConditionType.FewerThan:
      return <Trans i18nKey={elsewhereKey('condition.fewer-than', condition.where)} values={{ adventurer }} />
    // No threshold at all: the card is playable as soon as one such card is in play, and what it
    // gives is worth that very number (see {@link ConditionType.CardsInPlay}).
    case ConditionType.CardsInPlay:
      return <Trans i18nKey="condition.cards-in-play" values={{ adventurer }} />
  }
}

/** One arrow on the card is "the opponent's stand or the river", two arrows is "and". */
const elsewhereKey = (key: string, where: Elsewhere): string => `${key}.${where === Elsewhere.OpponentAndRiver ? 'and' : 'or'}`
