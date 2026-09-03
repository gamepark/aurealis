import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { Adventurer, AdventurerId, getMainType } from '@gamepark/aurealis/material/Adventurer'
import { AdventurerType } from '@gamepark/aurealis/material/AdventurerType'
import { BaseCamp } from '@gamepark/aurealis/material/BaseCamp'
import { getPlayableLine, getLineEffects } from '@gamepark/aurealis/material/AdventurerLines'
import { getCardsInPlay } from '@gamepark/aurealis/material/CardsInPlay'
import { Effect, EffectType } from '@gamepark/aurealis/material/Effect'
import { getPlantIcons, Jungle } from '@gamepark/aurealis/material/Jungle'
import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { Material, MaterialGame } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { opponentJungle, readerBaseCamp, readerJungle, scriptedCards, TutorialSetup, tutorialOpponent, tutorialPlayer } from './TutorialSetup'

/**
 * The tutorial shuffles everything its script does not name, so what the popups claim has to hold on
 * every shuffle rather than on one: each case here is run over many deals.
 */
const DEALS = 20

const setUp = (): MaterialGame<number, MaterialType, LocationType> => new TutorialSetup().setup({ players: 2 } as never)

const material = (game: MaterialGame<number, MaterialType, LocationType>, type: MaterialType) => new Material(type, game.items[type])

const hand = (game: MaterialGame<number, MaterialType, LocationType>, player: number) =>
  material(game, MaterialType.AdventurerCard).location(LocationType.PlayerHand).player(player)

const fronts = (cards: Material<number, MaterialType, LocationType>): Adventurer[] =>
  cards.getItems<AdventurerId>().map((item) => item.id.front!)

const countType = (cards: Material<number, MaterialType, LocationType>, type: AdventurerType) =>
  fronts(cards).filter((card) => getMainType(card) === type).length

/** What the card would give if it were played right now, which is what the popups announce. */
const effectsOf = (game: MaterialGame<number, MaterialType, LocationType>, card: Adventurer, player: number, opponent: number): Effect[] => {
  const cards = getCardsInPlay(new AurealisRules(game), player, opponent)
  const line = getPlayableLine(card, cards)
  return line ? getLineEffects(line, cards) : []
}

describe('The tutorial setup', () => {
  it('deals the reader the 2 cards the script has them play', () => {
    for (let deal = 0; deal < DEALS; deal++) {
      const game = setUp()
      expect(fronts(hand(game, tutorialPlayer))).toContain(scriptedCards.gold)
      expect(fronts(hand(game, tutorialPlayer))).toContain(scriptedCards.jungle)
      expect(hand(game, tutorialPlayer).length).toBe(5)
    }
  })

  it('deals the opponent the 2 cards the script has them play, and nothing that changes their value', () => {
    for (let deal = 0; deal < DEALS; deal++) {
      const game = setUp()
      const opponentHand = hand(game, tutorialOpponent)
      expect(fronts(opponentHand)).toContain(scriptedCards.animals)
      expect(fronts(opponentHand)).toContain(scriptedCards.moves)
      expect(opponentHand.length).toBe(5)
      // Exactly 2 of each: a third would turn 2 Animal pawns into 3, and 4 moves into 7.
      expect(countType(opponentHand, AdventurerType.Naturalist)).toBe(2)
      expect(countType(opponentHand, AdventurerType.Archaeologist)).toBe(2)
    }
  })

  it('is worth 7 gold to play the Cheffe d\'expédition of the first turn', () => {
    for (let deal = 0; deal < DEALS; deal++) {
      const game = setUp()
      expect(effectsOf(game, scriptedCards.gold, tutorialPlayer, tutorialOpponent)).toEqual([{ type: EffectType.Gold, gold: 7 }])
    }
  })

  it('is worth a Jungle card at 3 gold to play the Exploratrice, once the Cheffe is gone', () => {
    for (let deal = 0; deal < DEALS; deal++) {
      const game = setUp()
      // The reader plays the Cheffe first: the Exploratrice asks for the 2 they still hold.
      material(game, MaterialType.AdventurerCard)
        .id<AdventurerId>((id) => id.front === scriptedCards.gold)
        .getItem()!.location = { type: LocationType.AdventurerDiscard, x: 0 }
      expect(effectsOf(game, scriptedCards.jungle, tutorialPlayer, tutorialOpponent)).toEqual([
        { type: EffectType.BuyJungle, cost: 3, fromDeckBottom: false }
      ])
    }
  })

  it('is worth 2 Animal pawns and then 4 moves to the opponent', () => {
    for (let deal = 0; deal < DEALS; deal++) {
      const game = setUp()
      expect(effectsOf(game, scriptedCards.animals, tutorialOpponent, tutorialPlayer)).toEqual([{ type: EffectType.PlaceAnimals, count: 2 }])
      expect(effectsOf(game, scriptedCards.moves, tutorialOpponent, tutorialPlayer)).toEqual([{ type: EffectType.ArchaeologistMoves, count: 4 }])
    }
  })

  it('keeps the river clear of the cards that would change what the first turn is worth', () => {
    for (let deal = 0; deal < DEALS; deal++) {
      const game = setUp()
      const river = material(game, MaterialType.AdventurerCard).location(LocationType.AdventurerRiver)
      expect(river.length).toBe(4)
      expect(countType(river, AdventurerType.ExpeditionLeader)).toBe(0)
      // The opponent draws from the river: every slot must be one they may take without holding a
      // third Archéologue, since the reader takes one of them before they do.
      expect(countType(river, AdventurerType.Archaeologist)).toBe(0)
      // The top of the deck is the fifth back of the river, and counts like the other four.
      const top = material(game, MaterialType.AdventurerCard)
        .location(LocationType.AdventurerDeck)
        .maxBy((item) => item.location.x ?? 0)
      expect(getMainType(top.getItem<AdventurerId>()!.id.front!)).not.toBe(AdventurerType.ExpeditionLeader)
    }
  })

  it('gives each player the Jungle card the script plays out on', () => {
    for (let deal = 0; deal < DEALS; deal++) {
      const game = setUp()
      const jungleOf = (player: number) =>
        material(game, MaterialType.JungleCard).location(LocationType.PlayerJungle).player(player).getItem<Jungle>()!.id
      expect(jungleOf(tutorialPlayer)).toBe(readerJungle)
      expect(jungleOf(tutorialOpponent)).toBe(opponentJungle)
    }
  })

  it('keeps the Renommée Plante out of reach, whichever Jungle cards the reader buys', () => {
    for (let deal = 0; deal < DEALS; deal++) {
      const game = setUp()
      const deck = material(game, MaterialType.JungleCard)
        .location(LocationType.JungleDeck)
        .sort((card) => -(card.location.x ?? 0))
      const market = material(game, MaterialType.JungleCard).location(LocationType.JungleMarket)
      // The 2 cards of the market, and the 4 next cards of the deck: more than the tutorial draws.
      const reachable = [...market.getItems<Jungle>(), ...deck.limit(4).getItems<Jungle>()]
      expect(reachable.every((card) => getPlantIcons(card.id) === 0)).toBe(true)
      // 2 of them, plus the reader's own card, must stay under the 3 symbols the tile asks for.
      expect(getPlantIcons(readerJungle)).toBe(0)
    }
  })

  it('gives the reader the Camp de base whose improved power the script spends', () => {
    for (let deal = 0; deal < DEALS; deal++) {
      const game = setUp()
      const campOf = (player: number) =>
        material(game, MaterialType.BaseCampCard).location(LocationType.BaseCamp).player(player).getItem<BaseCamp>()!.id
      expect(campOf(tutorialPlayer)).toBe(readerBaseCamp)
      expect(campOf(tutorialOpponent)).not.toBe(readerBaseCamp)
    }
  })
})
