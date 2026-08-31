import {
  applyAutomaticMoves,
  isCreateItemType,
  isDeleteItem,
  isDeleteItemsAtOnce,
  isMoveItemType,
  isMoveItemTypeAtOnce,
  MaterialGame,
  MaterialMove
} from '@gamepark/rules-api'
import { beforeEach, describe, expect, it } from 'vitest'
import { AurealisRules } from '../AurealisRules'
import { AurealisSetup } from '../AurealisSetup'
import { archaeologistsAtCamp } from '../material/Archaeologists'
import { getAnimalSpaces, getArchaeologistSpaces, Jungle } from '../material/Jungle'
import { LocationType } from '../material/LocationType'
import { LegendaryAnimal, legendaryAnimals } from '../material/LegendaryAnimal'
import { MaterialType } from '../material/MaterialType'
import { Tile } from '../material/Tile'
import { AurealisMove } from './AurealisRule'
import { RuleId } from './RuleId'

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>

const PLAYER = 1

/**
 * The three cards of the row, left to right. The first is the one the Dig Site is built on, and its
 * Bonus Fouilles is "one Animal pawn on each of your Jungle cards" — the effect that fills a whole
 * row in one go, which is where the order the gains come in is felt.
 *
 * All three are one Animal pawn short of full and already carry their Dig Site, so that pawn
 * completes them: each gives up its Bonus Animal, then its Bonus Exploration.
 */
const CARDS = [Jungle.Jungle12, Jungle.Jungle10, Jungle.Jungle13]

/**
 * The bonuses of a Jungle card are not a step of the rules: they fall due when a pawn lands on the
 * space that unlocks them. An effect that fills several cards at once therefore makes several of
 * them fall due at the same moment, and the order they are then resolved in is the whole of what the
 * player sees.
 *
 * A card must give up what it holds *and* be paid for it before the next one is touched: anything
 * else has the whole row empty itself and turn over, and the gains rain down afterwards with nothing
 * left on the table to say which card each of them came from.
 */
describe('Several Jungle cards completed by a single effect', () => {
  let game: Game
  let cards: number[]

  beforeEach(() => {
    game = new AurealisSetup().setup({ players: 2 })
    const rules = new AurealisRules(game)
    // The row: the card dealt at setup, and 2 more taken out of the Jungle deck.
    const deck = rules.material(MaterialType.JungleCard).location(LocationType.JungleDeck).getIndexes()
    cards = [...rules.material(MaterialType.JungleCard).location(LocationType.PlayerJungle).player(PLAYER).getIndexes(), ...deck.slice(0, 2)]
    // The row is laid out against the order of the indexes on purpose: it reads on `x`, and the index
    // of a card says nothing about where it stands — a card bought late in the game lands at the end
    // of the row with whatever index it was printed with.
    cards.sort((a, b) => b - a)
    const items = game.items[MaterialType.JungleCard]!
    game.items[MaterialType.AnimalPawn] ??= []
    game.items[MaterialType.DigSitePawn] ??= []
    cards.forEach((card, index) => {
      const jungle = CARDS[index]
      items[card] = { id: jungle, location: { type: LocationType.PlayerJungle, player: PLAYER, x: index } }
      // One Animal space left free on every card, so that a single pawn each fills them all.
      for (let x = 0; x < getAnimalSpaces(jungle) - 1; x++) {
        game.items[MaterialType.AnimalPawn]!.push({ location: { type: LocationType.JungleAnimalSpace, parent: card, x } })
      }
      // The 2 cards on the right already hold their Dig Site; the first one is about to be dug.
      if (index > 0) game.items[MaterialType.DigSitePawn]!.push({ location: { type: LocationType.JungleDigSiteBonus, parent: card } })
    })
    // The team standing on every slot of the first card, which is what the Dig Site action asks for.
    const pawns = game.items[MaterialType.ArchaeologistPawn]!
    archaeologistsAtCamp(rules, PLAYER)
      .getIndexes()
      .slice(0, getArchaeologistSpaces(CARDS[0]))
      .forEach((pawn, x) => (pawns[pawn].location = { type: LocationType.JungleArchaeologistSpace, parent: cards[0], x }))
  })

  /** What the player sees, in the order they see it. Rule changes are left out: nothing moves on them. */
  const trace = (): string[] => {
    const rules = new AurealisRules(game)
    const move = rules.getLegalMoves(PLAYER).find(isCreateItemType(MaterialType.DigSitePawn))!
    const steps: string[] = []
    applyAutomaticMoves(new AurealisRules(game), [move], (played) => {
      const step = describeMove(played, new AurealisRules(game))
      if (step) steps.push(step)
    })
    return steps
  }

  const card = (parent?: number) => `card${cards.indexOf(parent!) + 1}`

  const describeMove = (move: MaterialMove<number, MaterialType, LocationType, RuleId>, rules: AurealisRules): string | undefined => {
    const played = move as AurealisMove
    if (isCreateItemType(MaterialType.DigSitePawn)(played)) return `dig site built on ${card(played.item.location.parent)}`
    if (isCreateItemType(MaterialType.AnimalPawn)(played)) return `animal pawn on ${card(played.item.location.parent)}`
    if (isMoveItemTypeAtOnce(MaterialType.ArchaeologistPawn)(played)) return 'team back to the camp'
    if (isDeleteItemsAtOnce(played)) return `${played.indexes.length} animal pawns to the supply`
    if (isMoveItemType(MaterialType.AnimalPawn)(played) && played.location.type === LocationType.JungleAnimalBonus) {
      return `animal bonus of ${card(played.location.parent)}`
    }
    if (isDeleteItem(played)) {
      const parent = rules.material(played.itemType).getItem(played.itemIndex).location.parent
      return `bonus pawn off ${card(parent)}`
    }
    if (isMoveItemType(MaterialType.JungleCard)(played)) return `${card(played.itemIndex)} turned over`
    // Only the tiles a bonus hands over: step III gives out the Fame tiles, which is another story.
    if (isMoveItemType(MaterialType.Tile)(played) && played.location.type === LocationType.PlayerTiles) {
      return rules.material(MaterialType.Tile).getItem(played.itemIndex).location.type === LocationType.Reserve ? 'tile taken' : undefined
    }
    return undefined
  }

  it('serves one card at a time, each paid for before the next is touched', () => {
    expect(trace()).toEqual([
      // The action itself, and the Bonus Fouilles it obtains: the team walks home, and the card gives
      // an Animal pawn to every card of the row.
      'dig site built on card1',
      'team back to the camp',
      'animal pawn on card1',
      'animal pawn on card2',
      'animal pawn on card3',
      // Then, left to right, the Bonus Animal of each card: the pawn slides onto its space and the
      // gain printed beside it is handed over before the next card is touched.
      '2 animal pawns to the supply',
      'animal bonus of card1',
      '3 animal pawns to the supply',
      'animal bonus of card2',
      'tile taken', // the Legendary Animal of card2
      '2 animal pawns to the supply',
      'animal bonus of card3',
      'tile taken', // the Legendary Animal of card3
      // Then, left to right again, the Bonus Exploration of the cards both bonuses have now closed.
      'bonus pawn off card1',
      'bonus pawn off card1',
      'card1 turned over',
      'tile taken', // the Relic of card1
      'bonus pawn off card2',
      'bonus pawn off card2',
      'card2 turned over',
      'tile taken', // the Relic of card2
      'bonus pawn off card3',
      'bonus pawn off card3',
      'card3 turned over',
      'tile taken' // the Relic of card3, whose 3 gold are coins, not a tile
    ])
  })

  it('leaves the three cards on their completed face', () => {
    trace()
    const rules = new AurealisRules(game)
    for (const index of cards) {
      expect(rules.material(MaterialType.JungleCard).getItem(index).location.rotation).toBeTruthy()
    }
    // 2 Legendary Animals — card1 gives none — and 3 Relics: 5 tiles taken out of the reserve.
    const tiles = rules.material(MaterialType.Tile).location(LocationType.PlayerTiles).player(PLAYER)
    expect(tiles.id((id: Tile) => id === Tile.Relic || legendaryAnimals.includes(id as LegendaryAnimal)).length).toBe(5)
  })
})
