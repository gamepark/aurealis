import { getEnumValues } from '@gamepark/rules-api'
import { AdventurerType } from './AdventurerType'

/**
 * The two other places an Adventurer card looks at, besides the player's own stand: the opponent's
 * stand and the Adventurer river. Both are read off card *backs*, which is why they can be counted
 * at all — a back carries the main type of the card, and only the main type ever counts for a
 * condition (rulebook p.4).
 *
 * On the card the difference is an arrow or a pair of them.
 */
export enum Elsewhere {
  /** One arrow: the opponent's stand or the river, whichever satisfies the condition. */
  OpponentOrRiver = 1,
  /** Two arrows: the opponent's stand and the river, both of them. */
  OpponentAndRiver
}

/** The 6 shapes of condition printed on the Adventurer cards (rulebook p.12). */
export enum ConditionType {
  /** No card of that type on your own stand. */
  NoneInHand = 1,
  /** The 4 types on your own stand. */
  AllTypesInHand,
  /** At least n cards of that type on your own stand. */
  MinInHand,
  /** At least n cards of that type in play: your stand, the opponent's, and the river. */
  MinInPlay,
  /** At least n cards of that type on the opponent's stand, or in the river, or in both. */
  MinElsewhere,
  /** Strictly more cards of that type than the opponent, or than the river, or than both. */
  MoreThan,
  /** Strictly fewer, likewise. */
  FewerThan,
  /**
   * "Pour ? cartes X en jeu": no threshold at all — the number of cards of that type in play is
   * what the effect of the line is worth. Met as soon as there is one, since a line worth nothing
   * would make the card unplayable for no reason.
   */
  CardsInPlay
}

export type Condition =
  | { type: ConditionType.NoneInHand, adventurer: AdventurerType }
  | { type: ConditionType.AllTypesInHand }
  | { type: ConditionType.MinInHand, adventurer: AdventurerType, count: number }
  | { type: ConditionType.MinInPlay, adventurer: AdventurerType, count: number }
  | { type: ConditionType.MinElsewhere, adventurer: AdventurerType, count: number, where: Elsewhere }
  | { type: ConditionType.MoreThan, adventurer: AdventurerType, where: Elsewhere }
  | { type: ConditionType.FewerThan, adventurer: AdventurerType, where: Elsewhere }
  | { type: ConditionType.CardsInPlay, adventurer: AdventurerType }

export const noneInHand = (adventurer: AdventurerType): Condition => ({ type: ConditionType.NoneInHand, adventurer })
export const allTypesInHand: Condition = { type: ConditionType.AllTypesInHand }
export const minInHand = (adventurer: AdventurerType, count: number): Condition => ({ type: ConditionType.MinInHand, adventurer, count })
export const minInPlay = (adventurer: AdventurerType, count: number): Condition => ({ type: ConditionType.MinInPlay, adventurer, count })
export const minElsewhere = (adventurer: AdventurerType, where: Elsewhere, count = 1): Condition => ({
  type: ConditionType.MinElsewhere,
  adventurer,
  count,
  where
})
export const cardsInPlay = (adventurer: AdventurerType): Condition => ({ type: ConditionType.CardsInPlay, adventurer })
export const moreThan = (adventurer: AdventurerType, where: Elsewhere): Condition => ({ type: ConditionType.MoreThan, adventurer, where })
export const fewerThan = (adventurer: AdventurerType, where: Elsewhere): Condition => ({ type: ConditionType.FewerThan, adventurer, where })

/** How many cards of each main type a place holds. */
export type TypeCount = Record<AdventurerType, number>

/**
 * The three places a condition can be about. The river is the 5 visible backs, the top of the
 * Adventurer deck being the fifth of them (rulebook p.6).
 */
export type CardsInPlay = {
  hand: TypeCount
  opponent: TypeCount
  river: TypeCount
}

/** The "?" of the cards that scale: how many cards of a type the three games hold between them. */
export const countInPlay = (cards: CardsInPlay, adventurer: AdventurerType): number =>
  cards.hand[adventurer] + cards.opponent[adventurer] + cards.river[adventurer]

export const noCards = (): TypeCount => ({
  [AdventurerType.Naturalist]: 0,
  [AdventurerType.Archaeologist]: 0,
  [AdventurerType.Explorer]: 0,
  [AdventurerType.ExpeditionLeader]: 0
})

const both = (where: Elsewhere, opponent: boolean, river: boolean) => (where === Elsewhere.OpponentAndRiver ? opponent && river : opponent || river)

export const meetsCondition = (condition: Condition, cards: CardsInPlay): boolean => {
  switch (condition.type) {
    case ConditionType.NoneInHand:
      return cards.hand[condition.adventurer] === 0
    case ConditionType.AllTypesInHand:
      return getEnumValues(AdventurerType).every((type) => cards.hand[type] > 0)
    case ConditionType.MinInHand:
      return cards.hand[condition.adventurer] >= condition.count
    case ConditionType.MinInPlay:
      return countInPlay(cards, condition.adventurer) >= condition.count
    case ConditionType.CardsInPlay:
      return countInPlay(cards, condition.adventurer) >= 1
    case ConditionType.MinElsewhere:
      return both(condition.where, cards.opponent[condition.adventurer] >= condition.count, cards.river[condition.adventurer] >= condition.count)
    case ConditionType.MoreThan: {
      const owned = cards.hand[condition.adventurer]
      return both(condition.where, owned > cards.opponent[condition.adventurer], owned > cards.river[condition.adventurer])
    }
    case ConditionType.FewerThan: {
      const owned = cards.hand[condition.adventurer]
      return both(condition.where, owned < cards.opponent[condition.adventurer], owned < cards.river[condition.adventurer])
    }
  }
}
