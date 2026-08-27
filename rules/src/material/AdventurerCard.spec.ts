import { getEnumValues } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import {
  AdventurerBack,
  adventurerCards,
  getAdventurerBack,
  getAdventurerCardId,
  getBackMainType,
  getBackSecondaryType,
  getMainType,
  getSecondaryType
} from './AdventurerCard'
import { AdventurerType } from './AdventurerType'

const types = getEnumValues(AdventurerType)
const backs = getEnumValues(AdventurerBack)

const countBy = <T extends number>(values: T[]) =>
  values.reduce((counts, value) => counts.set(value, (counts.get(value) ?? 0) + 1), new Map<T, number>())

describe('Adventurer cards', () => {
  it('has the 52 cards of the box, 13 of each main type', () => {
    expect(adventurerCards).toHaveLength(52)
    const perType = countBy(adventurerCards.map(getMainType))
    expect(types.every((type) => perType.get(type) === 13)).toBe(true)
  })

  it('has 13 cards of each secondary type', () => {
    const perType = countBy(adventurerCards.map(getSecondaryType))
    expect(types.every((type) => perType.get(type) === 13)).toBe(true)
  })

  it('gives every card a back that exists, and that agrees with the card on both types', () => {
    for (const card of adventurerCards) {
      const back = getAdventurerBack(card)
      expect(backs).toContain(back)
      expect(getBackMainType(back)).toBe(getMainType(card))
      expect(getBackSecondaryType(back)).toBe(getSecondaryType(card))
    }
  })

  it('uses all 16 backs, and the deck is balanced: 4 same-type cards and 3 of each cross-type', () => {
    const perBack = countBy(adventurerCards.map(getAdventurerBack))
    expect(perBack.size).toBe(16)
    for (const back of backs) {
      const sameType = getBackMainType(back) === getBackSecondaryType(back)
      expect(perBack.get(back)).toBe(sameType ? 4 : 3)
    }
  })

  it('builds an id that keeps the back when the front is hidden', () => {
    const card = adventurerCards[0]
    const id = getAdventurerCardId(card)
    expect(id).toEqual({ front: card, back: getAdventurerBack(card) })
    // what an opponent receives once hideFront has stripped id.front
    const hidden = { ...id }
    delete hidden.front
    expect(hidden.back).toBe(getAdventurerBack(card))
  })
})
