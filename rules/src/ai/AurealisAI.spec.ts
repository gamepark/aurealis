import { applyAutomaticMoves, isCustomMoveType, isMoveItemType, MaterialGame, MaterialItem } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { AurealisRules } from '../AurealisRules'
import { AurealisSetup } from '../AurealisSetup'
import { TILES_TO_WIN } from '../Constants'
import { Adventurer, AdventurerId } from '../material/Adventurer'
import { BaseCampPower } from '../material/BaseCamp'
import { buyJungle } from '../material/Effect'
import { Jungle } from '../material/Jungle'
import { givesTempleTile } from '../material/JungleState'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { countPlayerTiles } from '../material/PlayerTiles'
import { isTemple } from '../material/Temple'
import { Memory } from '../Memory'
import { CustomMoveType } from '../rules/CustomMoveType'
import { RuleId } from '../rules/RuleId'
import { chooseMove } from './AurealisAI'

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>

const newGame = (): Game => new AurealisSetup().setup({ players: 2 })

const items = (game: Game, type: MaterialType): MaterialItem<number, LocationType>[] => game.items[type]!

/**
 * Deals a wanted card to a place of the table, by swapping which card sits where. The locations are
 * left exactly as the setup built them, so everything the rules rely on still holds.
 */
const deal = <Id>(game: Game, type: MaterialType, index: number, matches: (id: Id) => boolean) => {
  const list = items(game, type)
  const from = list.findIndex((item) => matches(item.id as Id))
  expect(from, 'the wanted card is nowhere in the game').toBeGreaterThanOrEqual(0)
  const id = list[index].id
  list[index].id = list[from].id
  list[from].id = id
}

const dealJungle = (game: Game, index: number, jungle: Jungle) => deal<Jungle>(game, MaterialType.JungleCard, index, (id) => id === jungle)

const dealAdventurer = (game: Game, index: number, card: Adventurer) =>
  deal<AdventurerId>(game, MaterialType.AdventurerCard, index, (id) => id.front === card)

const setGold = (game: Game, player: number, amount: number) => {
  const kept = items(game, MaterialType.Coin).filter((item) => !(item.location.type === LocationType.PlayerCoins && item.location.player === player))
  game.items[MaterialType.Coin] = [...kept, { id: 1, quantity: amount, location: { type: LocationType.PlayerCoins, player } }]
}

/** The 3 cards a purchase reaches: the 2 laid beside the Jungle deck, and the face-up top of it. */
const marketIndexes = (game: Game): number[] => {
  const rules = new AurealisRules(game)
  return [
    ...rules.material(MaterialType.JungleCard).location(LocationType.JungleMarket).getIndexes(),
    ...rules
      .material(MaterialType.JungleCard)
      .location(LocationType.JungleDeck)
      .maxBy((item) => item.location.x ?? 0)
      .getIndexes()
  ]
}

const jungleOf = (game: Game, player: number): number =>
  new AurealisRules(game).material(MaterialType.JungleCard).location(LocationType.PlayerJungle).player(player).getIndex()

const handIndexes = (game: Game, player: number): number[] =>
  new AurealisRules(game).material(MaterialType.AdventurerCard).location(LocationType.PlayerHand).player(player).getIndexes()

/**
 * A table where neither player owns a Temple card and none is on the market, so that anything the
 * test puts there afterwards is the only one in sight.
 */
const withoutTemples = (game: Game) => {
  const plain = [Jungle.Jungle1, Jungle.Jungle2, Jungle.Jungle5, Jungle.Jungle7, Jungle.Jungle10]
  const places = [jungleOf(game, 1), jungleOf(game, 2), ...marketIndexes(game)]
  places.forEach((index, order) => dealJungle(game, index, plain[order]))
}

/** Both seats played by the bot, until someone wins or the game runs away with itself. */
const playWholeGame = (game: Game, limit = 4000): number => {
  let moves = 0
  while (game.rule && moves < limit) {
    const player = game.rule.player!
    const move = chooseMove(game, player)
    expect(move, `no move at rule ${game.rule.id} for player ${player}`).toBeDefined()
    applyAutomaticMoves(new AurealisRules(game), [move!])
    moves++
  }
  return moves
}

describe('The automatic player', () => {
  it('plays a whole game against itself, and one of the two wins it', () => {
    const game = newGame()
    const moves = playWholeGame(game)
    expect(game.rule).toBeUndefined()
    expect(moves).toBeLessThan(4000)
    const winner = game.memory[Memory.Winner]
    expect([1, 2]).toContain(winner)
    const rules = new AurealisRules(game)
    // The two ways the game ends: 7 tiles at the start of a turn, or a third Temple tile.
    const tiles = countPlayerTiles(rules, winner)
    const temples = rules.material(MaterialType.Tile).location(LocationType.PlayerTiles).player(winner).id(isTemple).length
    expect(tiles >= TILES_TO_WIN || temples >= 2).toBe(true)
  }, 60000)

  it('never leaves a player stuck: every game it plays reaches its end', () => {
    for (let game = 0; game < 3; game++) {
      const played = newGame()
      playWholeGame(played)
      expect(played.rule).toBeUndefined()
    }
  }, 60000)

  it('takes the Jungle card that gives a Temple tile over any other', () => {
    const game = newGame()
    withoutTemples(game)
    const [firstOfMarket] = marketIndexes(game)
    dealJungle(game, firstOfMarket, Jungle.Jungle3)
    game.rule = { id: RuleId.AcquireJungle, player: 1 }
    game.memory[Memory.PendingEffects] = []
    game.memory[Memory.CurrentEffect] = buyJungle(0)
    const move = chooseMove(game, 1)!
    expect(isMoveItemType(MaterialType.JungleCard)(move)).toBe(true)
    const taken = new AurealisRules(game).material(MaterialType.JungleCard).getItem<Jungle>((move as { itemIndex: number }).itemIndex).id
    expect(givesTempleTile(taken)).toBe(true)
    expect(taken).toBe(Jungle.Jungle3)
  })

  /**
   * The Camp de base is a last resort — 3 cards and the whole turn — but 7 gold for a Jungle card
   * that gives a Temple tile is worth every bit of it when nothing else reaches that card.
   */
  it('spends its Camp de base action on the Jungle power to buy a Temple card', () => {
    const game = newGame()
    withoutTemples(game)
    const [firstOfMarket] = marketIndexes(game)
    dealJungle(game, firstOfMarket, Jungle.Jungle3)
    // A hand no condition allows: three cards want all 4 types on the stand and there are but 3,
    // one wants a second Expedition Leader and there is none, and the last wants no Archaeologist.
    const dead = [Adventurer.Naturalist4, Adventurer.Archaeologist2, Adventurer.Explorer5, Adventurer.Explorer2, Adventurer.Explorer4]
    handIndexes(game, 1).forEach((index, order) => dealAdventurer(game, index, dead[order]))
    setGold(game, 1, 7)
    game.rule = { id: RuleId.ChooseAction, player: 1 }
    const moves = new AurealisRules(game).getLegalMoves(1)
    expect(moves.every((move) => isCustomMoveType(CustomMoveType.BaseCampPower)(move))).toBe(true)
    const move = chooseMove(game, 1)!
    expect(isCustomMoveType(CustomMoveType.BaseCampPower)(move)).toBe(true)
    expect((move as { data: BaseCampPower }).data).toBe(BaseCampPower.Jungle)
  })

  /**
   * Step IV is decided on backs alone, and a back carries the main type: the card to take is the one
   * that turns a hand nobody can play into a hand with something to do.
   */
  it('draws the card whose type unlocks the hand it already holds', () => {
    const game = newGame()
    withoutTemples(game)
    dealJungle(game, jungleOf(game, 1), Jungle.Jungle3)
    // Naturalist1 asks for a second Explorer on the stand; the other three ask for what one card
    // cannot bring. So the Explorer of the river is the only card that unlocks anything.
    const hand = handIndexes(game, 1)
    const kept = [Adventurer.Naturalist1, Adventurer.Explorer2, Adventurer.Naturalist4, Adventurer.Naturalist7]
    kept.forEach((card, order) => dealAdventurer(game, hand[order], card))
    // The fifth card goes to the discard: the stand is one short, so exactly one card is drawn.
    items(game, MaterialType.AdventurerCard)[hand[4]].location = { type: LocationType.AdventurerDiscard, x: 0 }
    const river = new AurealisRules(game).material(MaterialType.AdventurerCard).location(LocationType.AdventurerRiver).getIndexes()
    const offered = [Adventurer.Explorer1, Adventurer.Naturalist2, Adventurer.Archaeologist3, Adventurer.Naturalist5]
    river.forEach((index, order) => dealAdventurer(game, index, offered[order]))
    setGold(game, 1, 6)
    game.rule = { id: RuleId.RefillHand, player: 1 }
    const move = chooseMove(game, 1)!
    expect(isMoveItemType(MaterialType.AdventurerCard)(move)).toBe(true)
    const drawn = new AurealisRules(game).material(MaterialType.AdventurerCard).getItem<AdventurerId>((move as { itemIndex: number }).itemIndex).id
    expect(drawn.front).toBe(Adventurer.Explorer1)
  })
})
