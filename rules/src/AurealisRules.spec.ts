import { applyAutomaticMoves, CustomMove, isCustomMoveType, MaterialGame, MaterialMove, MaterialMoveBuilder } from '@gamepark/rules-api'
import { beforeEach, describe, expect, it } from 'vitest'
import { AurealisRules } from './AurealisRules'
import { AurealisSetup } from './AurealisSetup'
import { HAND_SIZE } from './Constants'
import { BaseCamp, BaseCampPower, isImprovedPower } from './material/BaseCamp'
import { coins } from './material/Coin'
import { movesOrGold } from './material/Effect'
import { Fame } from './material/Fame'
import { getArchaeologistSpaces, Jungle } from './material/Jungle'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { Memory } from './Memory'
import { CustomMoveType } from './rules/CustomMoveType'
import { RuleId } from './rules/RuleId'

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>

/** The dearest thing a Camp de base ever asks for: its common Jungle power, at 7 gold. */
const RICH_ENOUGH_FOR_ANY_POWER = 7

const newGame = (): Game => new AurealisSetup().setup({ players: 2 })

/** Plays a move the way the framework does: consequences first, depth first, until nothing is left. */
const play = (game: Game, move: MaterialMove<number, MaterialType, LocationType, RuleId>) => {
  applyAutomaticMoves(new AurealisRules(game), [move])
}

const chooseBaseCampPower = (game: Game, power: BaseCampPower) => {
  const move = new AurealisRules(game)
    .getLegalMoves(game.rule!.player!)
    .find((move) => isCustomMoveType(CustomMoveType.BaseCampPower)(move) && move.data === power)
  expect(move).toBeDefined()
  play(game, move!)
}

const discardWholeCost = (game: Game) => {
  while (game.rule?.id === RuleId.BaseCampDiscard) {
    play(game, new AurealisRules(game).getLegalMoves(game.rule.player!)[0])
  }
}

/**
 * Plays the first legal move over and over until the turn passes to the other player: enough to get
 * an action resolved when what it gives is beside the point of the test.
 */
const playUntilNextTurn = (game: Game) => {
  for (let step = 0; step < 50 && game.rule?.player === 1; step++) {
    const move = new AurealisRules(game).getLegalMoves(1)[0]
    expect(move).toBeDefined()
    play(game, move)
  }
  expect(game.rule).toEqual({ id: RuleId.ChooseAction, player: 2 })
}

/** Plays the first legal move over and over until the turn reaches step IV, the draw. */
const playUntilRefill = (game: Game) => {
  for (let step = 0; step < 50 && game.rule?.id !== RuleId.RefillHand; step++) {
    const move = new AurealisRules(game).getLegalMoves(game.rule!.player!)[0]
    expect(move).toBeDefined()
    play(game, move)
  }
  expect(game.rule?.id).toBe(RuleId.RefillHand)
}

/** Step IV: the player picks the cards they draw, so the turn only ends once the hand is full. */
const refillHand = (game: Game) => {
  while (game.rule?.id === RuleId.RefillHand) {
    const move = new AurealisRules(game).getLegalMoves(game.rule.player!)[0]
    expect(move).toBeDefined()
    play(game, move)
  }
}

const campOf = (game: Game) =>
  new AurealisRules(game).material(MaterialType.BaseCampCard).location(LocationType.BaseCamp).player(1).getItems<BaseCamp>()[0]

const improvedPowerOf = (game: Game): BaseCampPower =>
  [BaseCampPower.Gold, BaseCampPower.Animal, BaseCampPower.Moves, BaseCampPower.Jungle].find((power) => isImprovedPower(campOf(game).id, power))!

const handOf = (game: Game, player: number) =>
  new AurealisRules(game).material(MaterialType.AdventurerCard).location(LocationType.PlayerHand).player(player)

/** The cards just drawn that are still lying face down on the stand: on a stand, rotated is face down. */
const faceDownIn = (game: Game, player: number) => handOf(game, player).filter((item) => !!item.location.rotation)

const gold = (game: Game, player: number) =>
  new AurealisRules(game).material(MaterialType.Coin).location(LocationType.PlayerCoins).player(player).money(coins).count

/**
 * Gold in front of a player, counted out in coins the way the game itself hands it out.
 *
 * Buying a Jungle card is the one gain that can be out of reach before it is even started, so a
 * power or a card that offers nothing else is simply never proposed (see {@link ChooseActionRule}).
 * A starting purse of 3 gold does not cover the 5 an improved Camp de base asks, let alone the 7 of
 * a common one — which a test about anything other than money has to get out of its own way of.
 */
const giveGold = (game: Game, player: number, amount: number) => {
  const purse = new AurealisRules(game).material(MaterialType.Coin).location(LocationType.PlayerCoins).player(player).money(coins)
  for (const move of purse.addMoney(amount, { type: LocationType.PlayerCoins, player })) play(game, move)
}

describe('A turn of Aurealis', () => {
  let game: Game

  beforeEach(() => {
    game = newGame()
  })

  it('starts with the first player about to act', () => {
    expect(game.rule).toEqual({ id: RuleId.ChooseAction, player: 1 })
  })

  /**
   * The powers of the Camp de base are always on the table, whatever the hand holds — all but the
   * one that buys a Jungle card, which 3 gold does not pay for on the first turn (see
   * ChooseActionRule.spec). No Dig Site can be built on the first turn either: not one Archaeologist
   * has left the camp yet.
   */
  it('always offers the powers of the Camp de base, on top of the cards that can be played', () => {
    const moves = new AurealisRules(game).getLegalMoves(1)
    const powers = moves.filter((move) => isCustomMoveType(CustomMoveType.BaseCampPower)(move))
    expect(powers.map((move) => move.data)).toEqual([BaseCampPower.Gold, BaseCampPower.Animal, BaseCampPower.Moves])
    expect(moves.every((move) => isCustomMoveType(CustomMoveType.BaseCampPower)(move) || 'location' in move)).toBe(true)
    expect(moves.some((move) => 'itemType' in move && move.itemType === MaterialType.DigSitePawn)).toBe(false)
  })

  /**
   * A card is played by putting it on the face-up discard, where it stays in plain sight while its
   * effects are resolved. The hand is one card short until step IV fills it up again.
   */
  it('plays an Adventurer card, resolves it and ends up with a full hand again', () => {
    const playCard = new AurealisRules(game)
      .getLegalMoves(1)
      .find((move) => 'location' in move && move.location.type === LocationType.AdventurerDiscard)
    expect(playCard).toBeDefined()

    play(game, playCard!)
    expect(game.rule?.player).toBe(1)
    expect(new AurealisRules(game).material(MaterialType.AdventurerCard).location(LocationType.AdventurerDiscard).length).toBe(1)
    expect(new AurealisRules(game).material(MaterialType.AdventurerCard).location(LocationType.PlayerHand).player(1).length).toBe(HAND_SIZE - 1)

    playUntilNextTurn(game)
    const after = new AurealisRules(game)
    expect(after.material(MaterialType.AdventurerCard).location(LocationType.AdventurerDiscard).length).toBe(1)
    expect(after.material(MaterialType.AdventurerCard).location(LocationType.PlayerHand).player(1).length).toBe(HAND_SIZE)
  })

  it('pays a Camp de base action with 3 cards, then applies it and refills the hand', () => {
    const goldBefore = gold(game, 1)
    const gain = improvedPowerOf(game) === BaseCampPower.Gold ? 5 : 3
    chooseBaseCampPower(game, BaseCampPower.Gold)
    expect(game.rule).toEqual({ id: RuleId.BaseCampDiscard, player: 1 })

    discardWholeCost(game)
    refillHand(game)
    const rules = new AurealisRules(game)
    expect(gold(game, 1)).toBe(goldBefore + gain)
    expect(rules.material(MaterialType.AdventurerCard).location(LocationType.AdventurerDiscard).length).toBe(3)
    expect(rules.material(MaterialType.AdventurerCard).location(LocationType.PlayerHand).player(1).length).toBe(HAND_SIZE)
    expect(rules.material(MaterialType.AdventurerCard).location(LocationType.AdventurerRiver).length).toBe(4)
    expect(game.rule).toEqual({ id: RuleId.ChooseAction, player: 2 })
  })

  /**
   * Each Camp de base improves one of the four powers on its face A, and using that one is what
   * turns the card over. Any other power leaves it as it is.
   */
  it('turns the Camp de base onto its face B when its improved power is used', () => {
    // Whichever Camp de base was drawn, both halves need every one of its four powers on the table:
    // one of them is a purchase, and a player who cannot pay for it is never offered it.
    giveGold(game, 1, RICH_ENOUGH_FOR_ANY_POWER)
    const camp = new AurealisRules(game).material(MaterialType.BaseCampCard).location(LocationType.BaseCamp).player(1).getItems<BaseCamp>()[0]
    const commonPower = [BaseCampPower.Gold, BaseCampPower.Animal, BaseCampPower.Moves, BaseCampPower.Jungle].find(
      (power) => !isImprovedPower(camp.id, power)
    )!
    chooseBaseCampPower(game, commonPower)
    expect(campOf(game).location.rotation).toBeUndefined()

    game = newGame()
    giveGold(game, 1, RICH_ENOUGH_FOR_ANY_POWER)
    chooseBaseCampPower(game, improvedPowerOf(game))
    expect(campOf(game).location.rotation).toBe(true)
  })

  /** Moves are the one gain a player may use only in part, so they alone can be given up. */
  it('lets the player spend Archaeologist moves one card at a time, and give up the rest', () => {
    const granted = improvedPowerOf(game) === BaseCampPower.Moves ? 5 : 3
    chooseBaseCampPower(game, BaseCampPower.Moves)
    discardWholeCost(game)
    expect(game.rule).toEqual({ id: RuleId.MoveArchaeologists, player: 1 })
    expect(game.memory[Memory.Remaining]).toBe(granted)

    const rules = new AurealisRules(game)
    const jungle = rules.material(MaterialType.JungleCard).location(LocationType.PlayerJungle).player(1).getIndex()
    const toFirstCard = rules
      .getLegalMoves(1)
      .find((move) => 'location' in move && move.location.type === LocationType.JungleArchaeologistSpace && move.location.parent === jungle)
    expect(toFirstCard).toBeDefined()

    play(game, toFirstCard!)
    expect(game.memory[Memory.Remaining]).toBe(granted - 1)
    expect(new AurealisRules(game).material(MaterialType.ArchaeologistPawn).location(LocationType.JungleArchaeologistSpace).parent(jungle).length).toBe(1)
    expect(new AurealisRules(game).material(MaterialType.ArchaeologistPawn).location(LocationType.BaseCampArchaeologists).player(1).length).toBe(6)

    const pass = new AurealisRules(game).getLegalMoves(1).find((move) => isCustomMoveType(CustomMoveType.Pass)(move))
    expect(pass).toBeDefined()
    play(game, pass!)
    expect(game.memory[Memory.Remaining]).toBe(0)
    playUntilNextTurn(game)
  })

  /**
   * A gain to split between moves and gold: the gold is taken in one go and closes the effect. One
   * move says the amount, whatever coins it takes to pay it.
   */
  it('cashes in everything left the moment gold is taken', () => {
    const goldBefore = gold(game, 1)
    game.memory[Memory.CurrentEffect] = movesOrGold(4)
    play(game, MaterialMoveBuilder.startRule(RuleId.MoveArchaeologists))
    expect(game.memory[Memory.Remaining]).toBe(4)

    const takeGold = new AurealisRules(game)
      .getLegalMoves(1)
      .find((move) => isCustomMoveType(CustomMoveType.GainGold)(move))
    expect(takeGold).toBeDefined()
    expect((takeGold as CustomMove).data).toBe(4)

    play(game, takeGold!)
    expect(gold(game, 1)).toBe(goldBefore + 4)
    expect(game.rule).toEqual({ id: RuleId.ChooseAction, player: 2 })
  })

  /**
   * A Dig Site asks for every Archaeologist space of the card, and gives them all back to the camp
   * once it is built. The pawns are placed by hand here: getting them there through the game would
   * take as many turns as the card has spaces.
   */
  it('builds a Dig Site on a full card and sends its Archaeologists home', () => {
    const rules = new AurealisRules(game)
    const card = rules.material(MaterialType.JungleCard).location(LocationType.PlayerJungle).player(1).getIndex()
    const spaces = getArchaeologistSpaces(rules.material(MaterialType.JungleCard).getItem<Jungle>(card).id)
    const pawns = rules.material(MaterialType.ArchaeologistPawn).location(LocationType.BaseCampArchaeologists).player(1).getIndexes()
    pawns.slice(0, spaces).forEach((pawn, x) => {
      game.items[MaterialType.ArchaeologistPawn]![pawn].location = { type: LocationType.JungleArchaeologistSpace, parent: card, x }
    })

    const build = new AurealisRules(game).getLegalMoves(1).find((move) => 'item' in move && move.itemType === MaterialType.DigSitePawn)
    expect(build).toBeDefined()

    play(game, build!)
    const after = new AurealisRules(game)
    expect(after.material(MaterialType.DigSitePawn).location(LocationType.JungleDigSiteBonus).parent(card).length).toBe(1)
    expect(after.material(MaterialType.ArchaeologistPawn).location(LocationType.JungleArchaeologistSpace).parent(card).length).toBe(0)
    expect(after.material(MaterialType.ArchaeologistPawn).location(LocationType.BaseCampArchaeologists).player(1).length).toBe(7)
    // The Bonus Fouilles of the card can ask for more, but the hand is untouched: nothing to draw.
    playUntilNextTurn(game)
    expect(new AurealisRules(game).material(MaterialType.AdventurerCard).location(LocationType.PlayerHand).player(1).length).toBe(HAND_SIZE)
  })

  /**
   * "Sélectionnez vos cartes d'un seul coup, sans les remplacer ni regarder leurs effets": a card
   * drawn goes onto the stand at once, but face down — a rotated card, hidden from its owner too —
   * and they all turn over together once the hand is full.
   */
  it('keeps the drawn cards face down on the stand until the hand is full again', () => {
    chooseBaseCampPower(game, BaseCampPower.Gold)
    discardWholeCost(game)
    expect(game.rule!.id).toBe(RuleId.RefillHand)

    play(game, new AurealisRules(game).getLegalMoves(1)[0])
    expect(handOf(game, 1).length).toBe(3)
    expect(faceDownIn(game, 1).length).toBe(1)

    refillHand(game)
    expect(handOf(game, 1).length).toBe(HAND_SIZE)
    expect(faceDownIn(game, 1).length).toBe(0)
  })

  /** Face down on a stand is hidden from its owner as much as from the opponent. */
  it('hides a face-down card from the player holding it', () => {
    chooseBaseCampPower(game, BaseCampPower.Gold)
    discardWholeCost(game)
    play(game, new AurealisRules(game).getLegalMoves(1)[0])

    const drawn = faceDownIn(game, 1).getIndexes()[0]
    const view = new AurealisRules(game).getPlayerView(1)
    expect(view.items[MaterialType.AdventurerCard]![drawn].id.front).toBeUndefined()
    expect(view.items[MaterialType.AdventurerCard]![drawn].id.back).toBeDefined()

    // And once the hand is full again, its owner reads it like any other card on their stand.
    refillHand(game)
    const revealed = new AurealisRules(game).getPlayerView(1)
    expect(revealed.items[MaterialType.AdventurerCard]![drawn].id.front).toBeDefined()
    expect(new AurealisRules(game).getPlayerView(2).items[MaterialType.AdventurerCard]![drawn].id.front).toBeUndefined()
  })

  /**
   * The waiting room only earns its place while a card is still to be chosen after the one just
   * taken. So every card of a draw but the last waits above the stand, and the last one lands on it
   * — which means a turn costing a single card, as an ordinary turn does, never uses it at all.
   */
  it('draws the last card of a turn face up, and the others face down', () => {
    playUntilRefill(game)

    while (game.rule?.id === RuleId.RefillHand) {
      const last = HAND_SIZE - handOf(game, 1).length === 1
      play(game, new AurealisRules(game).getLegalMoves(1)[0])
      // Every card but the last lands rotated, and the last one is what turns them all over.
      expect(faceDownIn(game, 1).length === 0).toBe(last)
    }

    expect(handOf(game, 1).length).toBe(HAND_SIZE)
    expect(game.rule).toEqual({ id: RuleId.ChooseAction, player: 2 })
  })

  /** Past the printed slots of a card, the Archaeologists gather in the middle of it. */
  it('gathers the Archaeologists with no slot left in the middle of the card', () => {
    const rules = new AurealisRules(game)
    const card = rules.material(MaterialType.JungleCard).location(LocationType.PlayerJungle).player(1).getIndex()
    const spaces = getArchaeologistSpaces(rules.material(MaterialType.JungleCard).getItem<Jungle>(card).id)
    rules
      .material(MaterialType.ArchaeologistPawn)
      .location(LocationType.BaseCampArchaeologists)
      .player(1)
      .getIndexes()
      .slice(0, spaces)
      .forEach((pawn, x) => {
        game.items[MaterialType.ArchaeologistPawn]![pawn].location = { type: LocationType.JungleArchaeologistSpace, parent: card, x }
      })

    chooseBaseCampPower(game, BaseCampPower.Moves)
    discardWholeCost(game)
    const move = new AurealisRules(game)
      .getLegalMoves(1)
      .find((move) => 'location' in move && move.location.parent === card)
    expect(move).toBeDefined()

    play(game, move!)
    const after = new AurealisRules(game)
    expect(after.material(MaterialType.ArchaeologistPawn).location(LocationType.JungleArchaeologistSpace).parent(card).length).toBe(spaces)
    expect(after.material(MaterialType.ArchaeologistPawn).location(LocationType.JungleExtraArchaeologists).parent(card).length).toBe(1)
  })

  it('gives the Fame tile for 3 Jungle cards to whoever gets there first', () => {
    const rules = new AurealisRules(game)
    const market = rules.material(MaterialType.JungleCard).location(LocationType.JungleMarket).getIndexes()
    for (const card of market) {
      game.items[MaterialType.JungleCard]![card].location = { type: LocationType.PlayerJungle, player: 1, x: 9 + card }
    }
    chooseBaseCampPower(game, BaseCampPower.Gold)
    playUntilNextTurn(game)
    const fame = new AurealisRules(game).material(MaterialType.Tile).id(Fame.Jungle).location(LocationType.PlayerTiles).player(1)
    expect(fame.length).toBe(1)
  })
})
