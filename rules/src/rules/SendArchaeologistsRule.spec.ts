import { applyAutomaticMoves, isMoveItemType, MaterialGame, MaterialMove, MaterialMoveBuilder } from '@gamepark/rules-api'
import { beforeEach, describe, expect, it } from 'vitest'
import { AurealisRules } from '../AurealisRules'
import { AurealisSetup } from '../AurealisSetup'
import { sendArchaeologists } from '../material/Effect'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Memory } from '../Memory'
import { CustomMoveType } from './CustomMoveType'
import { RuleId } from './RuleId'

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>

/**
 * Sending Archaeologists anywhere is the one thing the game asks in two clicks: the pawn, then the
 * card. The first click is played the way the display plays it — locally, on this player's screen
 * alone — so what it does to the legal moves is what these tests are about.
 */
describe('Sending Archaeologists onto any Jungle card', () => {
  let game: Game

  /** A player with two Jungle cards, a full camp, and 2 Archaeologists to send anywhere. */
  beforeEach(() => {
    game = new AurealisSetup().setup({ players: 2 })
    const rules = new AurealisRules(game)
    // The market is handed over to player 1, so their row is long enough to send a pawn across it.
    rules
      .material(MaterialType.JungleCard)
      .location(LocationType.JungleMarket)
      .getIndexes()
      .forEach((card, x) => {
        game.items[MaterialType.JungleCard]![card].location = { type: LocationType.PlayerJungle, player: 1, x: 9 + x }
      })
    game.memory[Memory.CurrentEffect] = sendArchaeologists(2)
    applyAutomaticMoves(new AurealisRules(game), [MaterialMoveBuilder.startRule(RuleId.SendArchaeologists)])
  })

  const sendMoves = (rules: AurealisRules) =>
    rules.getLegalMoves(1).filter((move) => isMoveItemType(MaterialType.ArchaeologistPawn)(move))

  /** Every pawn of the camp may go onto every card: nothing is picked yet, so nothing is ruled out. */
  it('offers every pawn while none is picked', () => {
    const moves = sendMoves(new AurealisRules(game))
    const pawns = new Set(moves.map((move) => move.itemIndex))
    expect(game.rule!.id).toBe(RuleId.SendArchaeologists)
    expect(pawns.size).toBe(7)
  })

  /**
   * Picking a pawn is not a move of the game: it never reaches the legal moves, so nothing sends it
   * to the server and nothing writes it in the history.
   */
  it('never offers the pick itself as a legal move', () => {
    const picks = new AurealisRules(game)
      .getLegalMoves(1)
      .filter((move) => 'type' in move && move.type === CustomMoveType.SelectArchaeologist)
    expect(picks).toHaveLength(0)
  })

  /** Played the way the display plays it: locally, and the moves left are that pawn's alone. */
  it('narrows the moves down to the pawn picked, and back again when it is unpicked', () => {
    const pawn = sendMoves(new AurealisRules(game))[0].itemIndex
    const pick = MaterialMoveBuilder.customMove(CustomMoveType.SelectArchaeologist, pawn) as MaterialMove<
      number,
      MaterialType,
      LocationType,
      RuleId
    >

    new AurealisRules(game).play(pick, { local: true, player: 1 })
    expect(game.memory[Memory.SelectedArchaeologist]).toBe(pawn)
    expect(new Set(sendMoves(new AurealisRules(game)).map((move) => move.itemIndex))).toEqual(new Set([pawn]))

    // The same button again is the way back out of a choice made by mistake.
    new AurealisRules(game).play(pick, { local: true, player: 1 })
    expect(game.memory[Memory.SelectedArchaeologist]).toBeUndefined()
    expect(new Set(sendMoves(new AurealisRules(game)).map((move) => move.itemIndex)).size).toBe(7)
  })

  /** The pawn has landed: what the player picked is spent, and the next one is picked from scratch. */
  it('forgets the pick once the pawn has been sent', () => {
    const move = sendMoves(new AurealisRules(game))[0]
    const pick = MaterialMoveBuilder.customMove(CustomMoveType.SelectArchaeologist, move.itemIndex) as MaterialMove<
      number,
      MaterialType,
      LocationType,
      RuleId
    >
    new AurealisRules(game).play(pick, { local: true, player: 1 })

    applyAutomaticMoves(new AurealisRules(game), [move])
    expect(game.memory[Memory.SelectedArchaeologist]).toBeUndefined()
    expect(game.memory[Memory.Remaining]).toBe(1)
  })
})
