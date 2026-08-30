import { applyAutomaticMoves, isCustomMoveType, isMoveItemType, MaterialGame, MaterialMoveBuilder } from '@gamepark/rules-api'
import { beforeEach, describe, expect, it } from 'vitest'
import { AurealisRules } from '../AurealisRules'
import { AurealisSetup } from '../AurealisSetup'
import { Effect, movesOrGold, moves as movesEffect, sendArchaeologists } from '../material/Effect'
import { Jungle } from '../material/Jungle'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Memory } from '../Memory'
import { CustomMoveType } from '../rules/CustomMoveType'
import { RuleId } from '../rules/RuleId'
import { chooseMove } from './AurealisAI'

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>

const PLAYER = 1

/** 4 Archaeologist slots, 2 and 1: the three widths the tests need. */
const WIDE = Jungle.Jungle7
const NARROW = Jungle.Jungle12
const SINGLE = Jungle.Jungle3

/**
 * The orders the bot marches its Archaeologists by (see {@link Pawns}): to the first card of the row
 * with a slot left to fill, never leftwards, never off a Dig Site being built, and the pawn closest
 * to that card first.
 */
describe('The Archaeologists of the automatic player', () => {
  let game: Game

  beforeEach(() => {
    game = new AurealisSetup().setup({ players: 2 })
  })

  /** Player 1's row, rebuilt as the cards the test asks for, empty and in that order. */
  const setRow = (ids: Jungle[]): number[] => {
    const cards = game.items[MaterialType.JungleCard]!
    const row = cards.flatMap((card, index) => (card.location.type === LocationType.PlayerJungle && card.location.player === PLAYER ? [index] : []))
    const spare = cards.flatMap((card, index) => (card.location.type === LocationType.JungleMarket ? [index] : []))
    while (row.length < ids.length) row.push(spare.shift()!)
    row.forEach((card, x) => {
      cards[card].id = ids[x]
      cards[card].location = { type: LocationType.PlayerJungle, player: PLAYER, x }
    })
    return row
  }

  const campPawns = (): number[] =>
    game.items[MaterialType.ArchaeologistPawn]!.flatMap((pawn, index) =>
      pawn.location.type === LocationType.BaseCampArchaeologists && pawn.location.player === PLAYER ? [index] : []
    )

  /** Takes pawns off the Camp de base and stands them on a card, on its slots or in its middle. */
  const stand = (card: number, type: LocationType, count: number): number[] => {
    const pawns = game.items[MaterialType.ArchaeologistPawn]!
    const moved = campPawns().slice(0, count)
    moved.forEach((pawn, x) => (pawns[pawn].location = { type, parent: card, x }))
    return moved
  }

  /** The Bonus Fouilles of a card taken, which is what closes it to a second Dig Site. */
  const buildDigSite = (card: number) => {
    game.items[MaterialType.DigSitePawn] ??= []
    game.items[MaterialType.DigSitePawn]!.push({ location: { type: LocationType.JungleDigSiteBonus, parent: card } })
  }

  /** The effect being resolved, and the rule that spends it. */
  const start = (effect: Effect, rule: RuleId) => {
    game.memory[Memory.PendingEffects] = []
    game.memory[Memory.CurrentEffect] = effect
    applyAutomaticMoves(new AurealisRules(game), [MaterialMoveBuilder.startRule(rule)])
    expect(game.rule?.id, 'the rule under test handed over before the bot could play').toBe(rule)
  }

  /** The pawn the bot moves, and the Jungle card it puts it on. */
  const played = (): { pawn: number, card: number } => {
    const move = chooseMove(game, PLAYER)!
    expect(isMoveItemType(MaterialType.ArchaeologistPawn)(move), `the bot played ${JSON.stringify(move)}`).toBe(true)
    const pawnMove = move as { itemIndex: number, location: { parent: number } }
    return { pawn: pawnMove.itemIndex, card: pawnMove.location.parent }
  }

  it('walks the pawn closest to the first card left to fill', () => {
    const row = setRow([SINGLE, WIDE])
    buildDigSite(row[0])
    const [ahead] = stand(row[0], LocationType.JungleExtraArchaeologists, 1)
    start(movesEffect(2), RuleId.MoveArchaeologists)
    // The camp is full of pawns, but the one card further in is the one whose step fills a slot.
    expect(played()).toEqual({ pawn: ahead, card: row[1] })
  })

  it('never takes an Archaeologist off the Dig Site it is building', () => {
    const row = setRow([SINGLE, WIDE])
    const [digging] = stand(row[0], LocationType.JungleArchaeologistSpace, 1)
    start(movesEffect(2), RuleId.MoveArchaeologists)
    const { pawn, card } = played()
    expect(pawn).not.toBe(digging)
    // The only pawns free to walk are at the camp, and their step takes them onto the first card.
    expect(campPawns()).toContain(pawn)
    expect(card).toBe(row[0])
  })

  it('walks right all the same once every card of the row is done', () => {
    const row = setRow([SINGLE, WIDE])
    row.forEach(buildDigSite)
    const [ahead] = stand(row[0], LocationType.JungleExtraArchaeologists, 1)
    start(movesEffect(2), RuleId.MoveArchaeologists)
    expect(played()).toEqual({ pawn: ahead, card: row[1] })
  })

  it('cashes in the moves it has nowhere to walk', () => {
    const row = setRow([SINGLE, WIDE])
    buildDigSite(row[1])
    // 1 pawn building the Dig Site of the first card, and the whole rest of the team on the last one.
    stand(row[0], LocationType.JungleArchaeologistSpace, 1)
    stand(row[1], LocationType.JungleExtraArchaeologists, 6)
    expect(campPawns()).toHaveLength(0)
    start(movesOrGold(3), RuleId.MoveArchaeologists)
    const move = chooseMove(game, PLAYER)!
    expect(isCustomMoveType(CustomMoveType.GainGold)(move)).toBe(true)
    expect((move as { data: number }).data).toBe(3)
  })

  /** Distance costs nothing when a pawn is sent, so the ride goes where the walk would not reach. */
  it('sends the pawn furthest back onto the last card with a slot to fill', () => {
    const row = setRow([WIDE, NARROW, SINGLE])
    buildDigSite(row[2])
    stand(row[0], LocationType.JungleArchaeologistSpace, 1)
    start(sendArchaeologists(1), RuleId.SendArchaeologists)
    const { pawn, card } = played()
    expect(campPawns()).toContain(pawn)
    expect(card).toBe(row[1])
  })

  /** Nothing is ever declined here: a team with every pawn on a slot has to break one up all the same. */
  it('breaks up the rightmost card when every Archaeologist is on a slot', () => {
    const row = setRow([WIDE, NARROW, SINGLE])
    stand(row[0], LocationType.JungleArchaeologistSpace, 4)
    const onSecond = stand(row[1], LocationType.JungleArchaeologistSpace, 2)
    stand(row[2], LocationType.JungleArchaeologistSpace, 1)
    expect(campPawns()).toHaveLength(0)
    start(sendArchaeologists(1), RuleId.SendArchaeologists)
    const { pawn, card } = played()
    expect(onSecond).toContain(pawn)
    expect(card).toBe(row[2])
  })
})
