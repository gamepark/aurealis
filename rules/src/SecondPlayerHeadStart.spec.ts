import { describe, expect, it } from 'vitest'
import { AurealisRules } from './AurealisRules'
import { AurealisSetup } from './AurealisSetup'
import { freeAnimalSpaces, hasAnimalBonus } from './material/JungleState'
import { getAnimalSpaces, getJungleBonuses, Jungle, jungles } from './material/Jungle'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'

const SECOND_PLAYER = 2

/** A setup whose second player is dealt the given Jungle card as their first one. */
class FixedFirstJungleSetup extends AurealisSetup {
  constructor(private readonly jungle: Jungle) {
    super()
  }

  setupSecondPlayerHeadStart(player: number) {
    this.material(MaterialType.JungleCard).location(LocationType.PlayerJungle).player(player).getItem()!.id = this.jungle
    super.setupSecondPlayerHeadStart(player)
  }
}

/**
 * The Animal pawn of the second player's head start fills the only Animal space of Jungles 1, 11 and
 * 20: it must count as the Bonus Animal obtained, or the card could never be completed.
 */
describe('Second player head start on a card with a single Animal space', () => {
  const singleSpaceJungles = jungles.filter((jungle) => getAnimalSpaces(jungle) === 1)

  it('concerns cards whose Bonus Animal is empty', () => {
    expect(singleSpaceJungles).toEqual([Jungle.Jungle1, Jungle.Jungle11, Jungle.Jungle20])
    for (const jungle of singleSpaceJungles) expect(getJungleBonuses(jungle).animal).toEqual([])
  })

  it.each(singleSpaceJungles)('lays the pawn on the Bonus Animal of Jungle %s', (jungle) => {
    const game = new FixedFirstJungleSetup(jungle).setup({ players: 2 })
    const rules = new AurealisRules(game)
    const card = rules.material(MaterialType.JungleCard).location(LocationType.PlayerJungle).player(SECOND_PLAYER).getIndex()
    expect(hasAnimalBonus(rules, card)).toBe(true)
    expect(freeAnimalSpaces(rules, card)).toBe(0)
  })

  it('leaves the pawn on the first Animal space of a larger card', () => {
    const game = new FixedFirstJungleSetup(Jungle.Jungle2).setup({ players: 2 })
    const rules = new AurealisRules(game)
    const card = rules.material(MaterialType.JungleCard).location(LocationType.PlayerJungle).player(SECOND_PLAYER).getIndex()
    expect(hasAnimalBonus(rules, card)).toBe(false)
    expect(freeAnimalSpaces(rules, card)).toBe(getAnimalSpaces(Jungle.Jungle2) - 1)
  })
})
