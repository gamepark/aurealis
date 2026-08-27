import { applyAutomaticMoves, isCustomMoveType, isMoveItemType, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { beforeEach, describe, expect, it } from 'vitest'
import { AurealisRules } from '../AurealisRules'
import { AurealisSetup } from '../AurealisSetup'
import { Adventurer, AdventurerId } from '../material/Adventurer'
import { BaseCampPower } from '../material/BaseCamp'
import { coins } from '../material/Coin'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { CustomMoveType } from './CustomMoveType'
import { RuleId } from './RuleId'

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>
type Move = MaterialMove<number, MaterialType, LocationType, RuleId>

const play = (game: Game, move: Move) => applyAutomaticMoves(new AurealisRules(game), [move])

/** Exactly that much gold in front of the player, whatever the setup dealt them. */
const setGold = (game: Game, player: number, amount: number) => {
  const money = new AurealisRules(game).material(MaterialType.Coin).location(LocationType.PlayerCoins).player(player).money(coins)
  const location = { type: LocationType.PlayerCoins, player }
  const difference = amount - money.count
  const moves = difference >= 0 ? money.addMoney(difference, location) : money.removeMoney(-difference, location)
  moves.forEach((move) => play(game, move))
}

/**
 * Puts the given cards in the player's hand by swapping them with whatever holds them now, so that
 * the 52 cards of the box stay 52 distinct cards.
 */
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

const playableCards = (game: Game, player: number): Adventurer[] =>
  new AurealisRules(game)
    .getLegalMoves(player)
    .filter((move) => isMoveItemType(MaterialType.AdventurerCard)(move) && move.location.type === LocationType.AdventurerDiscard)
    .map((move) => front(game, (move as Extract<Move, { itemIndex: number }>).itemIndex))

const powers = (game: Game, player: number): BaseCampPower[] =>
  new AurealisRules(game)
    .getLegalMoves(player)
    .filter(isCustomMoveType(CustomMoveType.BaseCampPower))
    .map((move) => move.data as BaseCampPower)

/**
 * "Achetez une carte Jungle" is a gain like any other: the rules hand it out, they do not offer it.
 * A player who cannot pay for it would gain nothing at all, so what cannot be bought is never
 * offered — the card stays in hand, the power stays on the Camp de base, and the slash on a card
 * leaves only its other side to pick.
 */
describe('A Jungle card the player cannot pay for', () => {
  let game: Game

  beforeEach(() => {
    game = new AurealisSetup().setup({ players: 2 })
  })

  /** Explorer 2 asks for 2 Expedition Leaders in hand and gives nothing but a purchase at 3 gold. */
  it('leaves in hand a card whose only gain is that purchase', () => {
    dealHand(game, 1, [
      Adventurer.Explorer2,
      Adventurer.ExpeditionLeader1,
      Adventurer.ExpeditionLeader6,
      Adventurer.Naturalist5,
      Adventurer.Archaeologist9
    ])
    setGold(game, 1, 3)
    expect(playableCards(game, 1)).toContain(Adventurer.Explorer2)

    setGold(game, 1, 2)
    expect(playableCards(game, 1)).not.toContain(Adventurer.Explorer2)
  })

  /** Naturalist 4 places an Animal pawn *and* buys at 5: the pawn alone is worth playing it. */
  it('still plays a card that gives something else beside the purchase', () => {
    dealHand(game, 1, [
      Adventurer.Naturalist4,
      Adventurer.Archaeologist9,
      Adventurer.Explorer2,
      Adventurer.ExpeditionLeader6,
      Adventurer.Naturalist5
    ])
    setGold(game, 1, 0)
    expect(playableCards(game, 1)).toContain(Adventurer.Naturalist4)
  })

  /** Explorer 4 asks for no Archaeologist in hand and offers "buy at 4 / move 5 times". */
  it('offers only the other side of the slash once the card is played', () => {
    dealHand(game, 1, [
      Adventurer.Explorer4,
      Adventurer.Explorer2,
      Adventurer.Naturalist5,
      Adventurer.ExpeditionLeader6,
      Adventurer.ExpeditionLeader1
    ])
    setGold(game, 1, 3)
    const move = new AurealisRules(game)
      .getLegalMoves(1)
      .find(
        (move) =>
          isMoveItemType(MaterialType.AdventurerCard)(move) &&
          move.location.type === LocationType.AdventurerDiscard &&
          front(game, move.itemIndex) === Adventurer.Explorer4
      )
    expect(move).toBeDefined()
    play(game, move!)

    // The choice is left with one option, and it is the second one: 5 Archaeologist moves.
    expect(game.rule?.id).toBe(RuleId.ResolveEffects)
    const options = new AurealisRules(game)
      .getLegalMoves(1)
      .filter(isCustomMoveType(CustomMoveType.ChooseEffect))
      .map((move) => move.data as number)
    expect(options).toEqual([1])
  })

  /** The Jungle power of the Camp de base costs 7 gold, or 5 on the face A of the one that improves it. */
  it('keeps the Jungle power of the Camp de base out of the actions until the gold is there', () => {
    setGold(game, 1, 4)
    expect(powers(game, 1)).not.toContain(BaseCampPower.Jungle)

    setGold(game, 1, 7)
    expect(powers(game, 1)).toContain(BaseCampPower.Jungle)
  })
})
