import { MaterialGame, MaterialMove, playActionWithViews, replayAction } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { AurealisRules } from '../AurealisRules'
import { AurealisSetup } from '../AurealisSetup'
import { Adventurer, AdventurerId } from '../material/Adventurer'
import { coins } from '../material/Coin'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Memory } from '../Memory'
import { RuleId } from './RuleId'

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>
type Move = MaterialMove<number, MaterialType, LocationType, RuleId>

const setGold = (game: Game, player: number, amount: number) => {
  const money = new AurealisRules(game).material(MaterialType.Coin).location(LocationType.PlayerCoins).player(player).money(coins)
  const location = { type: LocationType.PlayerCoins, player }
  const difference = amount - money.count
  const moves = difference >= 0 ? money.addMoney(difference, location) : money.removeMoney(-difference, location)
  moves.forEach((move) => new AurealisRules(game).play(move))
}

const dealHand = (game: Game, player: number, cards: Adventurer[]) => {
  const items = game.items[MaterialType.AdventurerCard]!
  const hand = new AurealisRules(game).material(MaterialType.AdventurerCard).location(LocationType.PlayerHand).player(player).getIndexes()
  cards.forEach((card, position) => {
    const from = items.findIndex((item) => (item.id as AdventurerId).front === card)
    const to = hand[position]
    const swapped = items[to].id
    items[to].id = items[from].id
    items[from].id = swapped
  })
}

const front = (game: Game, index: number): Adventurer =>
  new AurealisRules(game).material(MaterialType.AdventurerCard).getItem<AdventurerId>(index).id.front!

/**
 * What the opponent's screen makes of a card being played: the front of a card on a stand is a
 * secret, so a client that reads it before the move has been applied reads nothing at all.
 */
describe('The card the opponent plays', () => {
  it('queues the same effects on the opponent screen as on the server', () => {
    const game = new AurealisSetup().setup({ players: 2 })
    dealHand(game, 1, [Adventurer.Explorer4, Adventurer.Explorer2, Adventurer.Naturalist5, Adventurer.ExpeditionLeader6, Adventurer.ExpeditionLeader1])
    setGold(game, 1, 3)

    const rules = new AurealisRules(game)
    const opponentGame: Game = JSON.parse(JSON.stringify(rules.getPlayerView(2)))
    const move = rules
      .getLegalMoves(1)
      .find((move) => 'itemIndex' in move && move.location?.type === LocationType.AdventurerDiscard && front(game, move.itemIndex) === Adventurer.Explorer4)
    expect(move).toBeDefined()

    const { views } = playActionWithViews(rules, move as Move, 1, [1, 2])
    const view = views.find((view) => view.recipient === 2)!
    replayAction(new AurealisRules(opponentGame, { player: 2 }), view.action)

    expect(opponentGame.rule?.id).toBe(game.rule?.id)
    expect(opponentGame.memory[Memory.PendingEffects]).toEqual(game.memory[Memory.PendingEffects])
    expect(opponentGame.memory[Memory.CurrentEffect]).toEqual(game.memory[Memory.CurrentEffect])
  })
})
