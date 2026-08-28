import { applyAutomaticMoves, isCreateItemType, MaterialGame } from '@gamepark/rules-api'
import { beforeEach, describe, expect, it } from 'vitest'
import { AurealisRules } from '../AurealisRules'
import { AurealisSetup } from '../AurealisSetup'
import { archaeologistsAtCamp, archaeologistsOn } from '../material/Archaeologists'
import { Jungle } from '../material/Jungle'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { RuleId } from './RuleId'

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>

const PLAYER = 1

/** 3 Archaeologist slots, and an Exploration bonus: the card the two bonuses can fall due on. */
const CARD = Jungle.Jungle11

/**
 * The bonuses of a Jungle card are watched on every item move, so two of them can fall due on the
 * very same one: building the Dig Site on a card whose Animal bonus was already taken obtains the
 * Exploration bonus in the same breath. Both then act on the Archaeologists standing on the slots —
 * the Dig Site walks them home, the completed face has no slot to leave them on — and they must not
 * contradict each other.
 */
describe('Two bonuses of a Jungle card falling due on the same move', () => {
  let game: Game
  let card: number

  beforeEach(() => {
    game = new AurealisSetup().setup({ players: 2 })
    const rules = new AurealisRules(game)
    card = rules.material(MaterialType.JungleCard).location(LocationType.PlayerJungle).player(PLAYER).getIndexes()[0]
    game.items[MaterialType.JungleCard]![card].id = CARD
    // The Animal bonus already taken: its pawn on the bonus space is the record of it.
    game.items[MaterialType.AnimalPawn] ??= []
    game.items[MaterialType.AnimalPawn]!.push({ location: { type: LocationType.JungleAnimalBonus, parent: card } })
    // The team standing on every slot, which is what the Dig Site action asks for.
    const pawns = game.items[MaterialType.ArchaeologistPawn]!
    archaeologistsAtCamp(rules, PLAYER)
      .getIndexes()
      .slice(0, 3)
      .forEach((pawn, x) => (pawns[pawn].location = { type: LocationType.JungleArchaeologistSpace, parent: card, x }))
  })

  /** The move the Dig Site action is: the pawn laid on the Bonus Fouilles of the card. */
  const buildDigSite = () => {
    const rules = new AurealisRules(game)
    const move = rules.getLegalMoves(PLAYER).find(isCreateItemType(MaterialType.DigSitePawn))!
    expect(move.item.location.parent).toBe(card)
    applyAutomaticMoves(new AurealisRules(game), [move])
  }

  it('turns the card onto its completed face and sends the team home, once', () => {
    buildDigSite()
    const rules = new AurealisRules(game)
    expect(rules.material(MaterialType.JungleCard).getItem(card).location.rotation).toBeTruthy()
    expect(archaeologistsOn(rules, card)).toHaveLength(0)
    expect(archaeologistsAtCamp(rules, PLAYER)).toHaveLength(7)
  })
})
