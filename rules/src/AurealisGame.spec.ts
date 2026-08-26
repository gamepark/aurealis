import { applyAutomaticMoves, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { AurealisRules } from './AurealisRules'
import { AurealisSetup } from './AurealisSetup'
import { HAND_SIZE, TILES_TO_WIN } from './Constants'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { Memory } from './Memory'
import { RuleId } from './rules/RuleId'

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>

/**
 * Whole games played at random, from the setup to the victory. Nothing here checks a rule in
 * particular: it checks that the rules always have a legal move to offer, that the material never
 * ends up somewhere it should not be, and that a game always reaches its end.
 */
const MOVES_PER_GAME = 4000

const playRandomGame = (): { game: Game; moves: number } => {
  const game: Game = new AurealisSetup().setup({ players: 2 })
  let moves = 0
  while (game.rule && moves < MOVES_PER_GAME) {
    const rules = new AurealisRules(game)
    const player = rules.getActivePlayer()!
    const legal = rules.getLegalMoves(player)
    expect(legal, `no legal move for player ${player} on rule ${game.rule.id}`).not.toHaveLength(0)
    applyAutomaticMoves(rules, [legal[Math.floor(Math.random() * legal.length)] as MaterialMove])
    moves++
    check(game)
  }
  return { game, moves }
}

/** What must hold between any two moves of any game. */
const check = (game: Game) => {
  const rules = new AurealisRules(game)
  // Every card of the box is still there: none is ever created, none is ever destroyed.
  expect(rules.material(MaterialType.AdventurerCard).length).toBe(52)
  expect(rules.material(MaterialType.JungleCard).length).toBe(20)
  for (const player of game.players) {
    const hand = rules.material(MaterialType.AdventurerCard).location(LocationType.PlayerHand).player(player).length
    const drawn = rules.material(MaterialType.AdventurerCard).location(LocationType.DrawnCards).player(player).length
    expect(hand + drawn).toBeLessThanOrEqual(HAND_SIZE)
    // The 7 pawns of a player are somewhere, and nowhere else than on their camp or their jungle.
    const camp = rules.material(MaterialType.ArchaeologistPawn).location(LocationType.BaseCampArchaeologists).player(player).length
    const cards = rules.material(MaterialType.JungleCard).location(LocationType.PlayerJungle).player(player).getIndexes()
    const onCards = cards.reduce(
      (total, card) =>
        total +
        rules.material(MaterialType.ArchaeologistPawn).location(LocationType.JungleArchaeologistSpace).parent(card).length +
        rules.material(MaterialType.ArchaeologistPawn).location(LocationType.JungleExtraArchaeologists).parent(card).length,
      0
    )
    expect(camp + onCards).toBe(7)
  }
  // A player never holds more than one Dig Site pawn per card, nor an Animal pawn on a completed card.
  for (const card of rules.material(MaterialType.JungleCard).getIndexes()) {
    expect(rules.material(MaterialType.DigSitePawn).location(LocationType.JungleDigSiteBonus).parent(card).length).toBeLessThanOrEqual(1)
    expect(rules.material(MaterialType.AnimalPawn).location(LocationType.JungleAnimalBonus).parent(card).length).toBeLessThanOrEqual(1)
  }
}

describe('A whole game of Aurealis', () => {
  it.each([1, 2, 3, 4, 5])('reaches its end and knows who won (game %i)', () => {
    const { game, moves } = playRandomGame()
    expect(moves, 'the game did not end').toBeLessThan(MOVES_PER_GAME)
    expect(game.rule).toBeUndefined()

    const winner = game.memory[Memory.Winner]
    expect(game.players).toContain(winner)
    const rules = new AurealisRules(game)
    expect(rules.rankPlayers(winner, winner === 1 ? 2 : 1)).toBeLessThan(0)

    // Either 7 tiles at the start of a turn, or the Instant Victory tile taken instead of a 3rd Temple.
    const tiles = [MaterialType.RelicTile, MaterialType.TempleTile, MaterialType.LegendaryAnimalTile, MaterialType.FameTile].reduce(
      (total, type) => total + rules.material(type).location(LocationType.PlayerTiles).player(winner).length,
      0
    )
    const instantVictory = rules.material(MaterialType.InstantVictoryTile).location(LocationType.PlayerTiles).player(winner).length
    expect(tiles >= TILES_TO_WIN || instantVictory === 1).toBe(true)
  })
})
