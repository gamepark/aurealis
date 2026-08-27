import { MaterialGame } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { AurealisRules } from '../AurealisRules'
import { AurealisSetup } from '../AurealisSetup'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { RuleId } from './RuleId'

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>

/**
 * The end of a turn, where whatever was drawn face down turns over in a single move (see
 * {@link RefillHandRule.endOfTurn}).
 */
describe('Turning the drawn cards over', () => {
  /**
   * The move carries no place for the cards it turns over, and a plain sequence reads that as "go to
   * the end of the row": three cards each sent to the end in turn come back in the order the items
   * array holds them, which is not the order they are standing in. Hence the hand's own strategy,
   * and hence this test — the cards are given an order the array deliberately contradicts.
   */
  it('leaves every card of the hand exactly where it stood', () => {
    const game: Game = new AurealisSetup().setup({ players: 2 })
    const rules = new AurealisRules(game)
    const hand = rules.material(MaterialType.AdventurerCard).location(LocationType.PlayerHand).player(1).getIndexes()
    // The three last cards of the stand are face down, and stand in an order the array does not follow.
    const order = [0, 1, 4, 2, 3]
    hand.forEach((card, index) => {
      game.items[MaterialType.AdventurerCard]![card].location = {
        type: LocationType.PlayerHand,
        player: 1,
        x: order[index],
        ...(order[index] >= 2 ? { rotation: true } : {})
      }
    })

    const faceDown = rules
      .material(MaterialType.AdventurerCard)
      .location(LocationType.PlayerHand)
      .player(1)
      .filter((item) => !!item.location.rotation)
    rules.play(faceDown.moveItemsAtOnce({ type: LocationType.PlayerHand, player: 1 }))

    expect(hand.map((card) => game.items[MaterialType.AdventurerCard]![card].location.x)).toEqual(order)
    expect(hand.every((card) => !game.items[MaterialType.AdventurerCard]![card].location.rotation)).toBe(true)
  })
})
