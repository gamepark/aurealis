import { applyAutomaticMoves, isMoveItemTypeAtOnce, MaterialGame, MaterialMoveBuilder } from '@gamepark/rules-api'
import { beforeEach, describe, expect, it } from 'vitest'
import { AurealisRules } from '../AurealisRules'
import { AurealisSetup } from '../AurealisSetup'
import { extraArchaeologistsOn } from '../material/Archaeologists'
import { moves } from '../material/Effect'
import { Jungle } from '../material/Jungle'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Memory } from '../Memory'
import { RuleId } from './RuleId'

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>

const PLAYER = 1

/** 4 Archaeologist slots, so a card that never caps a group by itself. */
const WIDE = Jungle.Jungle7
/** 2 of them, and 1: the two cards a group of 7 pawns runs out of room on. */
const NARROW = Jungle.Jungle12
const SINGLE = Jungle.Jungle3

/**
 * Walking a whole team one card to the right in a single move (see {@link MoveArchaeologistsRule}).
 *
 * It plays no move the one-pawn button could not play several times over, so what these tests are
 * about is how many pawns it takes along: the moves left to spend, and the room on the card they
 * reach — a group is one move to one place, and the printed slots of a card are filled before its
 * middle.
 */
describe('Walking a team of Archaeologists right together', () => {
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

  /** The pawns still on the Camp de base, in the order the state lists them. */
  const campPawns = (): number[] =>
    game.items[MaterialType.ArchaeologistPawn]!.flatMap((pawn, index) =>
      pawn.location.type === LocationType.BaseCampArchaeologists && pawn.location.player === PLAYER ? [index] : []
    )

  /**
   * The team spread over the hexagon spots of the camp from either end of it in turn, so that the
   * order the pawns were created in says nothing about the spots they hold: the 7 of them get
   * `x` 0, 6, 1, 5, 2, 4, 3.
   */
  const scatterCamp = (): number[] => {
    const camp = campPawns()
    camp.forEach((pawn, i) => {
      game.items[MaterialType.ArchaeologistPawn]![pawn].location.x = i % 2 ? camp.length - 1 - (i >> 1) : i >> 1
    })
    return camp
  }

  /** Takes pawns off the Camp de base and stands them on a card, on its slots or in its middle. */
  const stand = (card: number, type: LocationType, count: number) => {
    const pawns = game.items[MaterialType.ArchaeologistPawn]!
    campPawns()
      .slice(0, count)
      .forEach((pawn, x) => (pawns[pawn].location = { type, parent: card, x }))
  }

  /** The Bonus Fouilles of a card taken, which is what closes it to a second Dig Site. */
  const buildDigSite = (card: number) => {
    game.items[MaterialType.DigSitePawn] ??= []
    game.items[MaterialType.DigSitePawn]!.push({ location: { type: LocationType.JungleDigSiteBonus, parent: card } })
  }

  /** The effect being resolved, and the rule that spends it. */
  const start = (count: number) => {
    game.memory[Memory.CurrentEffect] = moves(count)
    applyAutomaticMoves(new AurealisRules(game), [MaterialMoveBuilder.startRule(RuleId.MoveArchaeologists)])
  }

  const groupMoves = () => new AurealisRules(game).getLegalMoves(PLAYER).filter(isMoveItemTypeAtOnce(MaterialType.ArchaeologistPawn))

  /** The camp holds 7 pawns and the card ahead has room for 4: 3 moves left is what caps the group. */
  it('takes as many pawns as there are moves left to spend', () => {
    const row = setRow([WIDE, WIDE])
    start(3)
    expect(groupMoves()).toHaveLength(1)
    const [group] = groupMoves()
    expect(group.indexes).toHaveLength(3)
    expect(group.location).toEqual({ type: LocationType.JungleArchaeologistSpace, parent: row[0] })
  })

  /**
   * The card ahead has 2 slots and 3 moves are left: the third pawn would land in the middle of it
   * instead, which is another move to another place, so the group stops at the slots.
   */
  it('stops the group at the last free slot of the card it reaches', () => {
    setRow([NARROW, WIDE])
    start(3)
    expect(groupMoves()[0].indexes).toHaveLength(2)
  })

  /** One slot ahead is one pawn, and a group of one is the single move already on the table. */
  it('offers nothing where only one pawn can go', () => {
    setRow([SINGLE, WIDE])
    start(3)
    expect(groupMoves()).toHaveLength(0)
  })

  /** A card whose slots are all taken gathers everyone in its middle, which has no limit. */
  it('takes the whole team onto a card with no slot left', () => {
    const row = setRow([WIDE, SINGLE])
    stand(row[1], LocationType.JungleArchaeologistSpace, 1)
    stand(row[0], LocationType.JungleExtraArchaeologists, 3)
    start(3)
    const group = groupMoves().find((move) => move.location.parent === row[1])!
    expect(group.indexes).toHaveLength(3)
    expect(group.location.type).toBe(LocationType.JungleExtraArchaeologists)
  })

  /**
   * The printed slots of a card are there to be filled, and filling them all is the one thing they
   * do: once its Dig Site is built the card is closed to a second one, so its slots are worth no
   * more than the middle of the card and the team gathers there instead.
   */
  it('gathers the team in the middle of a card whose Dig Site is already built', () => {
    const row = setRow([WIDE, WIDE])
    buildDigSite(row[1])
    stand(row[0], LocationType.JungleExtraArchaeologists, 3)
    start(3)
    const group = groupMoves().find((move) => move.location.parent === row[1])!
    expect(group.indexes).toHaveLength(3)
    expect(group.location.type).toBe(LocationType.JungleExtraArchaeologists)
  })

  /** Rightwards only, so the last card of the row is where a group stops being offered. */
  it('never offers a group off the last card of the row', () => {
    const row = setRow([WIDE, WIDE])
    stand(row[1], LocationType.JungleExtraArchaeologists, 3)
    start(3)
    expect(groupMoves().every((move) => move.location.parent !== row[1])).toBe(true)
  })

  /**
   * A team is the pawns gathered in the middle of a card, and only those: whoever stands on a
   * printed slot is building the Dig Site of the card, and taking them off it gives that up.
   *
   * So the group stops at the middle however many moves are left over — here 4 moves and 6 pawns on
   * the card, of which the group walks the 2 that are building nothing.
   */
  it('walks the pawns of the middle of a card away, and never those on its slots', () => {
    const row = setRow([WIDE, WIDE])
    stand(row[0], LocationType.JungleArchaeologistSpace, 4)
    stand(row[0], LocationType.JungleExtraArchaeologists, 2)
    start(4)
    const middle = extraArchaeologistsOn(new AurealisRules(game), row[0]).getIndexes()
    const group = groupMoves().find((move) => move.location.parent === row[1])!
    expect(group.indexes.slice().sort()).toEqual(middle.slice().sort())
  })

  /**
   * And nothing at all where every pawn of the card is on a slot: each of them is a Dig Site given
   * up, which is a decision taken one press at a time.
   */
  it('offers no group off a card whose Archaeologists all stand on its slots', () => {
    const row = setRow([WIDE, SINGLE])
    stand(row[1], LocationType.JungleArchaeologistSpace, 1)
    stand(row[0], LocationType.JungleArchaeologistSpace, 3)
    start(3)
    expect(groupMoves().every((move) => move.location.parent !== row[1])).toBe(true)
  })

  /**
   * Nothing tells two pawns of the Camp de base apart, so the group is taken from the far end of the
   * team — the highest `x`, which is the hexagon spot each of them holds — rather than from wherever
   * the state happens to list them. The camp then empties from its end, and the pawn one press takes
   * is the pawn the next press takes again.
   */
  it('walks the pawns at the end of the camp out first', () => {
    setRow([WIDE, WIDE])
    const camp = scatterCamp()
    start(3)
    expect(groupMoves()[0].indexes).toEqual([camp[1], camp[3], camp[5]])
  })

  /** A group is worth one move per pawn of it, and what is left of the effect carries on. */
  it('spends one move per pawn of the group', () => {
    setRow([NARROW, WIDE])
    start(3)
    applyAutomaticMoves(new AurealisRules(game), [groupMoves()[0]])
    expect(game.memory[Memory.Remaining]).toBe(1)
    expect(game.rule!.id).toBe(RuleId.MoveArchaeologists)
  })
})
