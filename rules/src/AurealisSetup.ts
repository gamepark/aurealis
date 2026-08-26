import { MaterialGameSetup } from '@gamepark/rules-api'
import { shuffle } from 'es-toolkit'
import { AurealisOptions } from './AurealisOptions'
import { AurealisRules } from './AurealisRules'
import { adventurers, getAdventurerId } from './material/Adventurer'
import { baseCamps } from './material/BaseCamp'
import { coins } from './material/Coin'
import { fames } from './material/Fame'
import { jungles } from './material/Jungle'
import { legendaryAnimals } from './material/LegendaryAnimal'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { temples } from './material/Temple'
import { RuleId } from './rules/RuleId'

/** Cards each player holds on their stand (rulebook p.2, step 1). */
const HAND_SIZE = 5
/** Archaeologist pawns each player starts with, waiting on their Camp de base (step 2). */
const ARCHAEOLOGISTS_PER_PLAYER = 7
/** Adventurer cards laid beside the deck: with the deck's own back, the river shows 5 backs (step 4). */
const RIVER_SIZE = 4
/** Jungle cards laid beside the deck: with the deck's face-up top card, the market shows 3 (step 6). */
const JUNGLE_MARKET_SIZE = 2
/** Temple tiles drawn among the 6; the other 2 go back in the box (step 7). */
const TEMPLE_TILES = 4
const RELIC_TILES = 9
const FIRST_PLAYER_GOLD = 3
const SECOND_PLAYER_GOLD = 4

/**
 * This class creates a new Game based on the game options
 */
export class AurealisSetup extends MaterialGameSetup<number, MaterialType, LocationType, AurealisOptions> {
  Rules = AurealisRules

  setupMaterial(_options: AurealisOptions) {
    this.setupAdventurerCards()
    this.setupJungleCards()
    this.setupTiles()
    this.setupReserve()
    this.setupPlayers()
  }

  /**
   * The 52 Adventurer cards are shuffled, each player draws their hand of 5, then 4 cards are laid
   * beside the deck. Nothing is revealed: deck, river and opponent's hand all show their back, which
   * is itself informative (main and secondary type).
   */
  setupAdventurerCards() {
    this.material(MaterialType.AdventurerCard).createItems(
      shuffle(adventurers).map((adventurer) => ({ id: getAdventurerId(adventurer), location: { type: LocationType.AdventurerDeck } }))
    )
    const deck = this.material(MaterialType.AdventurerCard).deck()
    for (const player of this.players) {
      deck.deal({ type: LocationType.PlayerHand, player }, HAND_SIZE)
    }
    deck.deal({ type: LocationType.AdventurerRiver }, RIVER_SIZE)
  }

  /**
   * The Jungle deck is built face up. Each player takes the first card for their own jungle, then the
   * 2 next ones join the deck to form the market of 3.
   */
  setupJungleCards() {
    this.material(MaterialType.JungleCard).createItems(shuffle(jungles).map((jungle) => ({ id: jungle, location: { type: LocationType.JungleDeck } })))
    const deck = this.material(MaterialType.JungleCard).deck()
    for (const player of this.players) {
      deck.dealOne({ type: LocationType.PlayerJungle, player })
    }
    deck.deal({ type: LocationType.JungleMarket }, JUNGLE_MARKET_SIZE)
  }

  /** 4 Temple tiles out of 6 and the 4 Fame tiles are on display; the 2 unused Temples never exist. */
  setupTiles() {
    this.material(MaterialType.TempleTile).createItems(
      shuffle(temples)
        .slice(0, TEMPLE_TILES)
        .map((temple, x) => ({ id: temple, location: { type: LocationType.TempleTilesRow, x } }))
    )
    this.material(MaterialType.FameTile).createItems(fames.map((fame, x) => ({ id: fame, location: { type: LocationType.FameTilesRow, x } })))
  }

  /**
   * The general supply, tiles only: they are counted, and running out of them changes the game.
   * Coins and the two supply pawns are not created here — they are static items of their
   * descriptions, drawn on the table but outside the game state, and only become items of the game
   * once a player owns one. Which is another way of saying their supply cannot run out.
   */
  setupReserve() {
    this.material(MaterialType.RelicTile).createItems(
      Array.from({ length: RELIC_TILES }, () => ({ location: { type: LocationType.Reserve } }))
    )
    this.material(MaterialType.LegendaryAnimalTile).createItems(
      shuffle(legendaryAnimals).map((id) => ({ id, location: { type: LocationType.Reserve } }))
    )
    this.material(MaterialType.InstantVictoryTile).createItem({ location: { type: LocationType.Reserve } })
  }

  /**
   * Each player gets a Camp de base card with their 7 Archaeologist pawns on it, and their first
   * Jungle card was already dealt with the Jungle deck.
   */
  setupPlayers() {
    const playerBaseCamps = shuffle(baseCamps)
    this.players.forEach((player, index) => {
      this.material(MaterialType.BaseCampCard).createItem({ id: playerBaseCamps[index], location: { type: LocationType.BaseCamp, player } })
      this.material(MaterialType.ArchaeologistPawn).createItems(
        Array.from({ length: ARCHAEOLOGISTS_PER_PLAYER }, () => ({ location: { type: LocationType.BaseCampArchaeologists, player } }))
      )
      this.material(MaterialType.Coin)
        .money(coins)
        .addMoney(index === 0 ? FIRST_PLAYER_GOLD : SECOND_PLAYER_GOLD, { type: LocationType.PlayerCoins, player })
    })
    this.setupSecondPlayerHeadStart(this.players[1])
  }

  /**
   * Playing second is compensated with one more gold (above) and a head start on the board: an
   * Archaeologist already stands on the first Jungle card, and an Animal pawn is on its first Animal
   * space (rulebook p.3).
   */
  setupSecondPlayerHeadStart(player: number) {
    const parent = this.material(MaterialType.JungleCard).location(LocationType.PlayerJungle).player(player).getIndex()
    // The 7 pawns of a Camp de base are one item carrying a quantity, so the move takes a single one out of the stack.
    this.material(MaterialType.ArchaeologistPawn)
      .location(LocationType.BaseCampArchaeologists)
      .player(player)
      .limit(1)
      .moveItem({ type: LocationType.JungleArchaeologistSpace, parent, x: 0 }, 1)
    // The Animal pawn comes from the inexhaustible supply, which holds no item: it is born on the card.
    this.material(MaterialType.AnimalPawn).createItem({ location: { type: LocationType.JungleAnimalSpace, parent, x: 0 } })
  }

  start() {
    this.startPlayerTurn(RuleId.TheFirstStep, this.players[0])
  }
}
