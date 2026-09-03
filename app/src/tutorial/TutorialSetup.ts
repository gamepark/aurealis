import { AurealisSetup } from '@gamepark/aurealis/AurealisSetup'
import { HAND_SIZE, JUNGLE_MARKET_SIZE, RIVER_SIZE } from '@gamepark/aurealis/Constants'
import { Adventurer, AdventurerId, adventurers, getAdventurerId, getMainType } from '@gamepark/aurealis/material/Adventurer'
import { AdventurerType } from '@gamepark/aurealis/material/AdventurerType'
import { BaseCamp, baseCamps } from '@gamepark/aurealis/material/BaseCamp'
import { getPlantIcons, Jungle, jungles } from '@gamepark/aurealis/material/Jungle'
import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { shuffle } from 'es-toolkit'

/** The reader is the first player, so they open the game and their opponent gets the head start. */
export const tutorialPlayer = 1
export const tutorialOpponent = 2

/**
 * The cards the script names, and nothing else: every other card of the game is shuffled as usual,
 * so no two readers go through the same tutorial twice.
 *
 * - {@link ExpeditionLeader7} is worth 7 gold while its owner holds more Cheffes d'expédition than
 *   the opponent *and* than the river, which is what the hands and the river below guarantee.
 * - {@link Explorer2} buys a Jungle card for 3 gold with 2 Cheffes d'expédition in hand: the 2 the
 *   reader still holds once the first one is played.
 * - {@link Naturalist3} places 2 Animal pawns with 2 Naturalists in hand, and 3 with 3 of them.
 * - {@link Archaeologist10} gives 4 moves with 2 Archaeologists in hand, and 7 with 3 of them.
 */
export const scriptedCards = {
  /** The reader's first turn: 7 Pièces d'or. */
  gold: Adventurer.ExpeditionLeader7,
  /** The reader's second turn: a Jungle card for 3 gold. */
  jungle: Adventurer.Explorer2,
  /** The opponent's first turn: 2 Animal pawns, which complete their card. */
  animals: Adventurer.Naturalist3,
  /** The opponent's second turn: 4 Archaeologist moves. */
  moves: Adventurer.Archaeologist10
}

const scriptedList: Adventurer[] = Object.values(scriptedCards)

/** How many Cheffes d'expédition the reader opens with, {@link scriptedCards.gold} included. */
const LEADERS_IN_HAND = 3

/**
 * The reader's Jungle card. Its Bonus Exploration is a Temple tile, which is what the last popups
 * of the tutorial point at: the reader leaves the script with a card worth finishing.
 */
export const readerJungle = Jungle.Jungle3

/**
 * The opponent's Jungle card, and the one the whole script is played out on: 3 Animal spaces, one
 * of them taken by the head start of the second player, so the 2 pawns of {@link scriptedCards.animals}
 * fill it; 2 Archaeologist spaces, one taken likewise, so their moves fill it too; a Bonus Animal
 * that hands out a Legendary Animal tile, and a Bonus Exploration worth a Relic tile and 3 gold.
 */
export const opponentJungle = Jungle.Jungle13

/** The reader's Camp de base: the one whose improved power buys a Jungle card for 5 gold. */
export const readerBaseCamp = BaseCamp.BaseCamp4

const isLeader = (card: Adventurer) => getMainType(card) === AdventurerType.ExpeditionLeader

/**
 * The 2 kinds of card the river opens without.
 *
 * A Cheffe d'expédition there would cost the first turn its 7 gold. An Archéologue is a subtler
 * matter: the opponent refills their hand from that very river, and a third Archéologue would turn
 * the 4 moves the script announces into 7. The tutorial does filter their draw, but the filter needs
 * something left to pick — leaving the 4 slots clear is what guarantees it.
 */
const isRiverUnwelcome = (card: Adventurer) => isLeader(card) || getMainType(card) === AdventurerType.Archaeologist

/**
 * The table the tutorial opens on.
 *
 * Everything the script names is laid out by hand — 4 Adventurer cards, the 2 starting Jungle cards,
 * the reader's Camp de base — and everything else is shuffled. Two constraints beyond that, both of
 * them there to keep a popup from lying:
 *
 * - no Cheffe d'expédition and no Archéologue in the river, so that the card of the first turn is
 *   worth its 7 gold rather than 4, and so that the opponent always has something to draw that does
 *   not turn their 4 moves into 7 (see {@link isRiverUnwelcome});
 * - no Plant symbol on any Jungle card the reader can buy, so that the Renommée Plante tile does not
 *   turn up beside the Renommée Jungle one the script explains (3 symbols would take it).
 */
export class TutorialSetup extends AurealisSetup {
  /**
   * The 52 cards, the scripted ones dealt by name and the rest of each hand at random.
   *
   * The named cards leave the deck first, so that a filler never takes one of them, and the river is
   * dealt from what {@link isRiverUnwelcome} leaves. The top of the Adventurer deck is the fifth back
   * of that river and is kept clear of Cheffes d'expédition too (see {@link adventurerDeckOrder}).
   */
  setupAdventurerCards() {
    this.material(MaterialType.AdventurerCard).createItems(
      this.adventurerDeckOrder().map((adventurer) => ({ id: getAdventurerId(adventurer), location: { type: LocationType.AdventurerDeck } }))
    )
    this.dealCard(tutorialPlayer, scriptedCards.gold)
    this.dealCard(tutorialPlayer, scriptedCards.jungle)
    this.dealCard(tutorialOpponent, scriptedCards.animals)
    this.dealCard(tutorialOpponent, scriptedCards.moves)
    this.dealType(tutorialPlayer, AdventurerType.ExpeditionLeader, LEADERS_IN_HAND - 1)
    this.dealType(tutorialOpponent, AdventurerType.Naturalist, 1)
    this.dealType(tutorialOpponent, AdventurerType.Archaeologist, 1)
    // The opponent's fifth card is an Exploratrice: anything else would be a third Naturalist or a
    // third Archaeologist, and either would change what the 2 cards they play are worth.
    this.dealType(tutorialOpponent, AdventurerType.Explorer, 1)
    this.fillHand(tutorialPlayer)
    this.deckWithout(isRiverUnwelcome).limit(RIVER_SIZE).moveItems({ type: LocationType.AdventurerRiver })
  }

  /**
   * The order the deck is built in, which is the order it is drawn in: the last card created is its
   * top, and that top is the fifth visible back of the river. It must not be a Cheffe d'expédition,
   * and it must not be one of the scripted cards either, since those are dealt away.
   */
  private adventurerDeckOrder(): Adventurer[] {
    const deck = shuffle(adventurers)
    const canTop = (card: Adventurer) => !isLeader(card) && !scriptedList.includes(card)
    const top = deck.reduce((found, card, index) => (canTop(card) ? index : found), -1)
    ;[deck[top], deck[deck.length - 1]] = [deck[deck.length - 1], deck[top]]
    return deck
  }

  private dealCard(player: number, adventurer: Adventurer) {
    this.material(MaterialType.AdventurerCard)
      .location(LocationType.AdventurerDeck)
      .id<AdventurerId>((id) => id.front === adventurer)
      .moveItem({ type: LocationType.PlayerHand, player })
  }

  /** Random cards of one main type, the deck having been built in a shuffled order. */
  private dealType(player: number, type: AdventurerType, count: number) {
    this.deckWithout((card) => getMainType(card) !== type)
      .limit(count)
      .moveItems({ type: LocationType.PlayerHand, player })
  }

  private fillHand(player: number) {
    const missing = HAND_SIZE - this.material(MaterialType.AdventurerCard).location(LocationType.PlayerHand).player(player).length
    if (missing > 0) {
      this.deckWithout(() => false)
        .limit(missing)
        .moveItems({ type: LocationType.PlayerHand, player })
    }
  }

  private deckWithout(excluded: (card: Adventurer) => boolean) {
    return this.material(MaterialType.AdventurerCard)
      .location(LocationType.AdventurerDeck)
      .id<AdventurerId>((id) => id.front !== undefined && !excluded(id.front))
  }

  /**
   * The Jungle deck, built so that the 2 cards the script needs are on top of it — the reader is
   * dealt first, being the first player — and the cards without a Plant symbol right under them.
   * The market and the 2 refills of the tutorial are drawn from there, so nothing the reader may buy
   * moves them towards the Renommée Plante tile.
   */
  setupJungleCards() {
    const free = jungles.filter((jungle) => jungle !== readerJungle && jungle !== opponentJungle)
    const order = [
      ...shuffle(free.filter((jungle) => getPlantIcons(jungle) > 0)),
      ...shuffle(free.filter((jungle) => getPlantIcons(jungle) === 0)),
      opponentJungle,
      readerJungle
    ]
    this.material(MaterialType.JungleCard).createItems(order.map((jungle) => ({ id: jungle, location: { type: LocationType.JungleDeck } })))
    const deck = this.material(MaterialType.JungleCard).deck()
    for (const player of this.players) {
      deck.dealOne({ type: LocationType.PlayerJungle, player })
    }
    deck.deal({ type: LocationType.JungleMarket }, JUNGLE_MARKET_SIZE)
  }

  /** The reader takes the Camp de base the script uses; the opponent takes any of the 3 others. */
  protected playerBaseCamps(): BaseCamp[] {
    return [readerBaseCamp, ...shuffle(baseCamps.filter((camp) => camp !== readerBaseCamp))]
  }
}
