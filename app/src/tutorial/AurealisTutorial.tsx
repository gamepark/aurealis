import { css } from '@emotion/react'
import { AurealisOptions } from '@gamepark/aurealis/AurealisOptions'
import { Adventurer, AdventurerId, getMainType } from '@gamepark/aurealis/material/Adventurer'
import { AdventurerType } from '@gamepark/aurealis/material/AdventurerType'
import { BaseCampPower } from '@gamepark/aurealis/material/BaseCamp'
import { EffectType } from '@gamepark/aurealis/material/Effect'
import { Fame } from '@gamepark/aurealis/material/Fame'
import { getAnimalSpaces, getJungleBonuses, Jungle } from '@gamepark/aurealis/material/Jungle'
import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { Tile } from '@gamepark/aurealis/material/Tile'
import { CustomMoveType } from '@gamepark/aurealis/rules/CustomMoveType'
import { MaterialTutorial, TutorialStep } from '@gamepark/react-game'
import {
  isCreateItemType,
  isCreateItemTypeAtOnce,
  isCustomMoveType,
  isDeleteItemType,
  isDeleteItemTypeAtOnce,
  isMoveItemType,
  isMoveItemTypeAtOnce,
  MaterialGame,
  MaterialMove
} from '@gamepark/rules-api'
import { Trans } from 'react-i18next'
import { tutorialComponents } from './TutorialIcons'
import { scriptedCards, tutorialOpponent, tutorialPlayer, TutorialSetup } from './TutorialSetup'

type Game = MaterialGame<number, MaterialType, LocationType>
type Move = MaterialMove<number, MaterialType, LocationType>
type Step = TutorialStep<number, MaterialType, LocationType>

/** One popup, written in the translation files like every other text of the game. */
const text = (key: string) => () => <Trans i18nKey={`tutorial.${key}`} components={tutorialComponents}/>

const bulletList = css`
  margin: 0.4em 0 0 0;
  padding-left: 1.2em;
  text-align: left;

  li + li {
    margin-top: 0.2em;
  }
`

/** An aside under the text of a popup: what the reader may do, rather than what the game does. */
const asideLine = css`
  display: block;
  margin-top: 0.4em;
  font-style: italic;
`

/**
 * A popup and the aside under it, kept in a key of its own — one sentence per key, like every other
 * text of the game.
 */
const textWithAside = (key: string) => () => (
  <>
    <Trans i18nKey={`tutorial.${key}`} components={tutorialComponents}/>
    <span css={asideLine}>
      <Trans i18nKey={`tutorial.${key}-hint`} components={tutorialComponents}/>
    </span>
  </>
)

/** A popup made of a sentence and the list under it: the 4 types, and the 4 Camp de base powers. */
const listText = (key: string, items: string[]) => () => (
  <>
    <Trans i18nKey={`tutorial.${key}.intro`} components={tutorialComponents}/>
    <ul css={bulletList}>
      {items.map((item) => (
        <li key={item}>
          <Trans i18nKey={`tutorial.${key}.${item}`} components={tutorialComponents}/>
        </li>
      ))}
    </ul>
  </>
)

// ------------------------------------------------------------------ what a step waits for

const plays =
  (adventurer: Adventurer) =>
    (move: Move, game: Game): boolean =>
      isMoveItemType(MaterialType.AdventurerCard)(move) &&
      move.location.type === LocationType.AdventurerDiscard &&
      (drawn(move, game)?.id as AdventurerId | undefined)?.front === adventurer

const draws = (move: Move) => isMoveItemType(MaterialType.AdventurerCard)(move) && move.location.type === LocationType.PlayerHand

/** The card the reader is told to take, and only that one: the first slot of the river. */
const drawsFirstRiverCard = (move: Move, game: Game): boolean =>
  draws(move) && drawn(move, game)?.location.x === 0

/**
 * The opponent refills their hand with anything but an Archéologue: a third one would turn the 4
 * moves of {@link scriptedCards.moves} into 7, and the popup that announces them would be wrong.
 */
const drawsNoArchaeologist = (move: Move, game: Game): boolean => {
  if (!draws(move)) return false
  const front = (drawn(move, game)?.id as AdventurerId | undefined)?.front
  return front !== undefined && getMainType(front) !== AdventurerType.Archaeologist
}

/** The card a draw is taking, read on the table it is being taken from. */
const drawn = (move: Move, game: Game) =>
  isMoveItemType(MaterialType.AdventurerCard)(move) ? game.items[MaterialType.AdventurerCard]?.[move.itemIndex] : undefined

const discards = (move: Move): boolean =>
  isMoveItemType(MaterialType.AdventurerCard)(move) && move.location.type === LocationType.AdventurerDiscard

const buysJungle = (move: Move): boolean => isMoveItemType(MaterialType.JungleCard)(move) && move.location.type === LocationType.PlayerJungle

const usesJunglePower = (move: Move): boolean =>
  isCustomMoveType(CustomMoveType.BaseCampPower)(move) && move.data === BaseCampPower.Jungle

const placesAnimals = (move: Move): boolean => isCreateItemTypeAtOnce(MaterialType.AnimalPawn)(move)

const walksOneArchaeologist = (move: Move): boolean => isMoveItemType(MaterialType.ArchaeologistPawn)(move)

const walksArchaeologistTeam = (move: Move): boolean => isMoveItemTypeAtOnce(MaterialType.ArchaeologistPawn)(move)

const buildsDigSite = (move: Move): boolean => isCreateItemType(MaterialType.DigSitePawn)(move)

// ------------------------------------------------------------------ what a step holds back

/**
 * The Animal column collapsing onto its bonus space: the extra pawns go back to the supply and the
 * last one slides down. Held back so that the popup describing it is read while the column is still
 * full (see {@link AurealisRule.takeAnimalBonus}).
 */
const takesAnimalBonus = (move: MaterialMove): boolean =>
  isDeleteItemTypeAtOnce(MaterialType.AnimalPawn)(move) ||
  (isMoveItemType(MaterialType.AnimalPawn)(move) && move.location.type === LocationType.JungleAnimalBonus)

/** A Discovery or Fame tile reaching a player's row, which is what a bonus is played for. */
const winsTile = (move: MaterialMove): boolean => isMoveItemType(MaterialType.Tile)(move) && move.location.type === LocationType.PlayerTiles

/** The Camp de base turning onto its face B once its improved power has given what it promised. */
const flipsBaseCamp = (move: MaterialMove): boolean => isMoveItemType(MaterialType.BaseCampCard)(move)

/** The team walking home from the slots of the card a Dig Site has just been built on. */
const archaeologistsGoHome = (move: MaterialMove): boolean =>
  isMoveItemTypeAtOnce(MaterialType.ArchaeologistPawn)(move) && move.location.type === LocationType.BaseCampArchaeologists

/** The card being emptied and turned onto its completed face, which the Bonus Exploration opens. */
const completesJungle = (move: MaterialMove): boolean =>
  isDeleteItemType(MaterialType.DigSitePawn)(move) || (isMoveItemType(MaterialType.JungleCard)(move) && move.location.rotation === true)

// ------------------------------------------------------------------ how much table a focus keeps

/** A Jungle card is 6.3 x 8.8: what is left of it once the left two thirds are cropped away. */
const animalColumn = { left: -4, right: 0.2, top: 0.2, bottom: 0.2 }
/**
 * Around the lit discs, the rest of the card they are printed on: measured from the topmost of the
 * 3 spaces of a card that has 3, so the whole card is in view while only its column is out of the
 * dark (see {@link LocationType.JungleAnimalSpaceHighlight}).
 */
const litColumn = { left: 4.8, right: 0.5, top: 3.1, bottom: 2.4 }
/** The bonus bar at the foot of a Jungle card. */
const bonusBar = { top: -6.6, bottom: 0.2, left: 0.2, right: 0.2 }
/** The column of Archaeologist slots, along the left edge. */
const archaeologistColumn = { right: -4, left: 0.2, top: 0.2, bottom: 0.2 }
/** Room around a card that is being read rather than located. */
const cardMargin = { top: 1, bottom: 1, left: 1, right: 1 }

/**
 * The tutorial of Aurealis: 3 turns of the reader against Joachim, at the end of which they take the
 * game over and play it out against the machine.
 *
 * Each of the 3 turns is one of the 3 actions of the game — playing an Adventurer card, buying a
 * Jungle card with an Exploratrice, and using the Camp de base — and everything the reader is told
 * about on their own turns is something they do. What they only watch is what happens on the other
 * side of the table: the opponent completes an Animal column, walks a team of Archaeologists and
 * builds a Dig Site, which is how the Bonus Animal, the Bonus Fouilles and the Bonus Exploration are
 * shown without costing the reader a turn each.
 *
 * The table is laid out for that scenario and nothing more: 4 Adventurer cards, the 2 starting
 * Jungle cards and one Camp de base are fixed, everything else is shuffled (see {@link TutorialSetup}).
 */
export class AurealisTutorial extends MaterialTutorial<number, MaterialType, LocationType> {
  version = 1

  options: AurealisOptions = { players: 2 } as AurealisOptions

  setup = new TutorialSetup()

  players = [
    { id: tutorialPlayer },
    {
      id: tutorialOpponent,
      name: 'Joachim',
      avatar: {
        topType: 'ShortHairShortWaved',
        accessoriesType: 'Blank',
        hairColor: 'Brown',
        facialHairType: 'BeardLight',
        facialHairColor: 'Brown',
        clotheType: 'ShirtCrewNeck',
        clotheColor: 'Heather',
        eyeType: 'Happy',
        eyebrowType: 'Default',
        mouthType: 'Smile',
        skinColor: 'Light'
      }
    }
  ]

  steps: Step[] = [
    { popup: { text: text('welcome') } },
    { popup: { text: text('theme') } },

    /** The tiles, all four kinds of them at once: what they are worth is one number, and it is 7. */
    {
      popup: { text: text('tiles'), position: { x: -60 } },
      focus: (game) => ({ materials: [this.tilesOnDisplay(game)], margin: { top: 1, bottom: 1, left: 1, right: 1 } })
    },
    {
      popup: { text: text('jungle'), position: { y: -20 } },
      focus: (game) => ({ materials: [this.baseCamp(game, tutorialPlayer), this.jungle(game, tutorialPlayer)], margin: cardMargin })
    },
    {
      popup: { text: text('hand'), position: { y: -20 } },
      focus: (game) => ({ materials: [this.hand(game, tutorialPlayer)], margin: cardMargin })
    },
    {
      popup: { text: listText('types', ['leader', 'naturalist', 'explorer', 'archaeologist']), position: { x: 30 } },
      focus: (game) => ({ materials: [this.adventurerCards(game)], margin: cardMargin })
    },
    {
      popup: { text: text('river'), position: { x: 40 } },
      focus: (game) => ({ materials: [this.river(game)], margin: { top: 1, bottom: 1, left: 1, right: 30 } })
    },
    {
      popup: { text: text('opponent-hand'), position: { y: 20 } },
      focus: (game) => ({ materials: [this.hand(game, tutorialOpponent)], margin: cardMargin })
    },
    {
      popup: { text: text('conditions'), position: { y: -20 } },
      focus: (game) => ({ materials: [this.card(game, scriptedCards.gold)], margin: cardMargin })
    },

    /** Turn 1: the Cheffe d'expédition, worth 7 gold as long as the reader holds the most of them. */
    {
      popup: { text: text('play-leader'), position: { y: -20 } },
      focus: (game) => ({ materials: [this.card(game, scriptedCards.gold)], margin: cardMargin }),
      move: { filter: plays(scriptedCards.gold) }
    },
    {
      popup: { text: text('gold') },
      focus: (game) => ({ materials: [this.coins(game, tutorialPlayer), this.coins(game, tutorialOpponent)], margin: cardMargin })
    },
    {
      popup: { text: text('refill'), position: { x: 20, y: -10 } },
      focus: (game) => ({ materials: [this.firstRiverCard(game)], margin: { top: 1, bottom: 12, left: 1, right: 1 } }),
      move: { filter: drawsFirstRiverCard }
    },

    /** The opponent's first turn: an Animal column completed, and the tile its Bonus Animal gives. */
    { popup: { text: text('opponent-turn') } },
    { move: { player: tutorialOpponent, filter: plays(scriptedCards.animals) } },
    {
      popup: { text: text('opponent-card') },
      focus: (game) => ({ materials: [this.discardTop(game)], margin: cardMargin })
    },
    {
      popup: { text: text('animal-spaces'), position: { y: 20 } },
      focus: (game) => ({
        materials: [this.animalPawns(game, tutorialOpponent)],
        locations: this.animalSpaces(game, tutorialOpponent),
        margin: litColumn
      })
    },
    { move: { player: tutorialOpponent, filter: placesAnimals, interrupt: takesAnimalBonus } },
    {
      popup: { text: text('animal-column'), position: { y: 25 } },
      focus: (game) => ({ materials: [this.jungle(game, tutorialOpponent), this.animalPawns(game, tutorialOpponent)], margin: animalColumn }),
      move: { interrupt: winsTile }
    },
    {
      popup: { text: text('legendary-animal'), position: { y: 20 } },
      focus: (game) => ({
        materials: [this.jungle(game, tutorialOpponent), this.legendaryAnimalTile(game, tutorialOpponent)],
        margin: cardMargin
      }),
      move: {}
    },
    { move: { player: tutorialOpponent, filter: drawsNoArchaeologist } },

    /** Turn 2: the Exploratrice, and the Jungle market both players buy from. */
    {
      popup: { text: text('play-explorer'), position: { y: -20 } },
      focus: (game) => ({ materials: [this.card(game, scriptedCards.jungle)], margin: cardMargin }),
      move: { filter: plays(scriptedCards.jungle) }
    },
    {
      popup: { text: text('jungle-market'), position: { y: 20 } },
      focus: (game) => ({ materials: [this.jungleMarket(game)], margin: { top: 1, bottom: 10, left: 1, right: 1 } }),
      move: { filter: buysJungle }
    },
    {
      popup: { text: text('refill-2'), position: { x: 50 } },
      focus: (game) => ({ materials: [this.river(game), this.hand(game, tutorialPlayer)], margin: { top: 1, bottom: 1, left: 1, right: 30 } }),
      move: { filter: draws }
    },

    /** The opponent's second turn: the Archaeologists, and what a move is worth. */
    { move: { player: tutorialOpponent, filter: plays(scriptedCards.moves) } },
    {
      popup: { text: text('opponent-archaeologist') },
      focus: (game) => ({ materials: [this.discardTop(game)], margin: cardMargin })
    },
    {
      popup: { text: text('archaeologist-pawns'), position: { y: 20 } },
      focus: (game) => ({ materials: [this.archaeologists(game, tutorialOpponent)], margin: cardMargin })
    },
    {
      popup: { text: text('moves'), position: { y: 20 } },
      focus: (game) => ({ materials: [this.archaeologists(game, tutorialOpponent), this.jungle(game, tutorialOpponent)], margin: archaeologistColumn })
    },
    // The last free slot of the card, then the 3 pawns left walking on together into its middle.
    { move: { player: tutorialOpponent, filter: walksOneArchaeologist } },
    { move: { player: tutorialOpponent, filter: walksArchaeologistTeam } },
    { move: { player: tutorialOpponent, filter: draws } },

    /** Turn 3: the Camp de base, its 4 powers, and the improved one the reader spends. */
    {
      popup: { text: listText('base-camp', ['gold', 'animal', 'moves', 'jungle']), position: { y: -20 } },
      focus: (game) => ({ materials: [this.baseCamp(game, tutorialPlayer)], margin: { top: 10, bottom: 1, left: 1, right: 1 } })
    },
    {
      popup: { text: text('improved-power') },
      focus: (game) => ({ materials: [this.baseCamp(game, tutorialPlayer)], margin: cardMargin }),
      move: { filter: usesJunglePower }
    },
    {
      popup: { text: text('base-camp-discard'), position: { y: -20 } },
      focus: (game) => ({ materials: [this.hand(game, tutorialPlayer)], margin: cardMargin }),
      move: { filter: discards }
    },
    { move: { filter: discards } },
    { move: { filter: discards } },
    {
      popup: { text: text('base-camp-buy'), position: { y: 20 } },
      focus: (game) => ({ materials: [this.jungleMarket(game)], margin: { top: 1, bottom: 10, left: 1, right: 1 } }),
      move: { filter: buysJungle, interrupt: flipsBaseCamp }
    },
    {
      popup: { text: text('base-camp-flip'), position: { y: -20 } },
      focus: (game) => ({ materials: [this.baseCamp(game, tutorialPlayer)], margin: cardMargin }),
      move: { interrupt: winsTile }
    },
    /**
     * The Fame tile is held back across both popups: a step with no `move` of its own reads without
     * releasing what the step before it interrupted, so the reader is told what they are about to
     * take before it lands in front of them.
     */
    {
      popup: { text: text('fame-tiles'), position: { x: 20, y: 10 } },
      focus: (game) => ({ materials: [this.fameTiles(game)], margin: { top: 1, bottom: 10, left: 1, right: 1 } })
    },
    {
      popup: { text: text('fame-jungle'), position: { x: -20, y: -20 } },
      focus: (game) => ({ materials: [this.fameTile(game, Fame.Jungle), this.jungle(game, tutorialPlayer)], margin: cardMargin }),
      move: {}
    },
    {
      popup: { text: text('fame-warning') },
      focus: (game) => ({ materials: [this.fameTile(game, Fame.Jungle)], margin: cardMargin })
    },
    {
      popup: { text: text('refill-3'), position: { x: 50 } },
      focus: (game) => ({ materials: [this.river(game), this.hand(game, tutorialPlayer)], margin: { top: 1, bottom: 1, left: 1, right: 30 } }),
      move: { filter: draws }
    },
    { move: { filter: draws } },
    { move: { filter: draws } },

    /** The opponent's third turn: the Dig Site, and the card it completes. */
    {
      popup: { text: text('dig-site'), position: { y: 20 } },
      focus: (game) => ({
        materials: [this.jungle(game, tutorialOpponent), this.archaeologistsOnSlots(game, tutorialOpponent)],
        margin: archaeologistColumn
      })
    },
    { move: { player: tutorialOpponent, filter: buildsDigSite, interrupt: archaeologistsGoHome } },
    {
      popup: { text: text('dig-site-return'), position: { y: 20 } },
      focus: (game) => ({
        materials: [
          this.baseCamp(game, tutorialOpponent),
          this.jungle(game, tutorialOpponent),
          this.digSites(game, tutorialOpponent),
          this.jungleArchaeologists(game, tutorialOpponent)
        ],
        margin: cardMargin
      }),
      move: { interrupt: completesJungle }
    },
    {
      popup: { text: text('exploration'), position: { y: 20 } },
      focus: (game) => ({ materials: [this.jungle(game, tutorialOpponent)], margin: bonusBar }),
      move: {}
    },

    /** What the reader leaves the tutorial with: a card of their own worth a Temple tile. */
    {
      popup: { text: text('my-temple'), position: { y: -20 } },
      focus: (game) => ({ materials: [this.startingJungle(game, tutorialPlayer)], margin: bonusBar })
    },
    {
      popup: { text: textWithAside('temple-tiles'), position: { x: 20, y: 10 } },
      focus: (game) => ({ materials: [this.templeTiles(game)], margin: { top: 1, bottom: 10, left: 1, right: 1 } })
    },
    {
      popup: { text: text('victory'), position: { x: 20, y: 10 } },
      focus: (game) => ({ materials: [this.templeTiles(game), this.instantVictoryTile(game)], margin: { top: 1, bottom: 10, left: 1, right: 1 } })
    },
    { popup: { text: text('good-luck') } }
  ]

  // ------------------------------------------------------------------ what the focuses point at

  /** Every Adventurer card on the table: the 2 hands, the river and the deck. */
  private adventurerCards(game: Game) {
    return this.material(game, MaterialType.AdventurerCard)
  }

  private hand(game: Game, player: number) {
    return this.material(game, MaterialType.AdventurerCard).location(LocationType.PlayerHand).player(player)
  }

  private card(game: Game, adventurer: Adventurer) {
    return this.material(game, MaterialType.AdventurerCard).id<AdventurerId>((id) => id.front === adventurer)
  }

  /** The 4 cards beside the deck and the deck itself, which shows the fifth back of the river. */
  private river(game: Game) {
    return this.material(game, MaterialType.AdventurerCard).location(
      (location) => location.type === LocationType.AdventurerRiver || location.type === LocationType.AdventurerDeck
    )
  }

  private firstRiverCard(game: Game) {
    return this.material(game, MaterialType.AdventurerCard)
      .location(LocationType.AdventurerRiver)
      .sort((card) => card.location.x ?? 0)
      .limit(1)
  }

  /** The card just played, which is the top of the face up discard. */
  private discardTop(game: Game) {
    return this.material(game, MaterialType.AdventurerCard)
      .location(LocationType.AdventurerDiscard)
      .sort((card) => -(card.location.x ?? 0))
      .limit(1)
  }

  private jungle(game: Game, player: number) {
    return this.material(game, MaterialType.JungleCard).location(LocationType.PlayerJungle).player(player)
  }

  /** The Jungle card a player opens with, and the one the script is played out on: leftmost of their row. */
  private startingJungle(game: Game, player: number) {
    return this.jungle(game, player)
      .sort((card) => card.location.x ?? 0)
      .limit(1)
  }

  /**
   * The Animal discs printed on the card a player opens with, lit whether a pawn stands on one of
   * them or not: they are the spaces themselves, not the pawns that go there.
   */
  private animalSpaces(game: Game, player: number) {
    const card = this.startingJungle(game, player)
    const spaces = getAnimalSpaces(card.getItem<Jungle>()!.id)
    return Array.from(
      { length: spaces },
      (_, x) => this.location(LocationType.JungleAnimalSpaceHighlight).parent(card.getIndex()).x(x).location
    )
  }

  /** The Animal pawns already standing on that card: the head start the second player opens with. */
  private animalPawns(game: Game, player: number) {
    return this.material(game, MaterialType.AnimalPawn)
      .location(LocationType.JungleAnimalSpace)
      .parent(this.startingJungle(game, player).getIndex())
  }

  private jungleMarket(game: Game) {
    return this.material(game, MaterialType.JungleCard).location(
      (location) => location.type === LocationType.JungleMarket || location.type === LocationType.JungleDeck
    )
  }

  private baseCamp(game: Game, player: number) {
    return this.material(game, MaterialType.BaseCampCard).location(LocationType.BaseCamp).player(player)
  }

  /**
   * The 7 Archaeologists a player owns, wherever they stand: the team waiting on the Camp de base, and
   * the ones already in the jungle.
   *
   * Only the ones on the Camp de base carry the name of their owner. The others are told by the card
   * they stand on, which is why the jungle row is asked for its indexes first.
   */
  private archaeologists(game: Game, player: number) {
    const cards = this.jungle(game, player).getIndexes()
    return this.material(game, MaterialType.ArchaeologistPawn).location(
      (location) =>
        (location.type === LocationType.BaseCampArchaeologists && location.player === player) ||
        ((location.type === LocationType.JungleArchaeologistSpace || location.type === LocationType.JungleExtraArchaeologists) &&
          location.parent !== undefined &&
          cards.includes(location.parent))
    )
  }

  /** Those of them that have left the Camp: on a printed slot of one of the player's cards, or beside them. */
  private jungleArchaeologists(game: Game, player: number) {
    const cards = this.jungle(game, player).getIndexes()
    return this.material(game, MaterialType.ArchaeologistPawn).location(
      (location) =>
        (location.type === LocationType.JungleArchaeologistSpace || location.type === LocationType.JungleExtraArchaeologists) &&
        location.parent !== undefined &&
        cards.includes(location.parent)
    )
  }

  /**
   * Only those standing on a slot printed on the card.
   *
   * The ones gathered in the middle of it, past its slots, are passing through: a Dig Site is built
   * with the occupied slots alone, and only those go home once it is (see
   * {@link LocationType.JungleExtraArchaeologists}).
   */
  private archaeologistsOnSlots(game: Game, player: number) {
    return this.jungleArchaeologists(game, player).location(LocationType.JungleArchaeologistSpace)
  }

  /** The Dig Sites built on a player's Jungle cards, each on the bonus space of its own card. */
  private digSites(game: Game, player: number) {
    const cards = this.jungle(game, player).getIndexes()
    return this.material(game, MaterialType.DigSitePawn).location(
      (location) => location.type === LocationType.JungleDigSiteBonus && location.parent !== undefined && cards.includes(location.parent)
    )
  }

  private coins(game: Game, player: number) {
    return this.material(game, MaterialType.Coin).location(LocationType.PlayerCoins).player(player)
  }

  /** Every tile a player may end up with: the 2 rows on display, and the heaps of the supply. */
  private tilesOnDisplay(game: Game) {
    return this.material(game, MaterialType.Tile).location(
      (location) =>
        location.type === LocationType.TempleTilesRow || location.type === LocationType.FameTilesRow || location.type === LocationType.Reserve
    )
  }

  private templeTiles(game: Game) {
    return this.material(game, MaterialType.Tile).location(LocationType.TempleTilesRow)
  }

  private fameTiles(game: Game) {
    return this.material(game, MaterialType.Tile).location(LocationType.FameTilesRow)
  }

  /** One Fame tile wherever it stands: on display, or already in front of a player. */
  private fameTile(game: Game, fame: Fame) {
    return this.material(game, MaterialType.Tile).id(fame)
  }

  /**
   * The Legendary Animal tile a player's card is about to hand them.
   *
   * Every Jungle card names one of the 9, and they wait in the supply each in a square of its own,
   * none of them buried: the popup can point at the very tile that is coming while it is still there,
   * the move that brings it being held back until the reader has read (see {@link winsTile}).
   */
  private legendaryAnimalTile(game: Game, player: number) {
    const bonuses = getJungleBonuses(this.startingJungle(game, player).getItem<Jungle>()!.id)
    const tiles: Tile[] = bonuses.animal.flatMap((effect) => (effect.type === EffectType.LegendaryAnimalTile ? [effect.animal] : []))
    return this.material(game, MaterialType.Tile).id((id: Tile) => tiles.includes(id))
  }

  private instantVictoryTile(game: Game) {
    return this.material(game, MaterialType.Tile).id(Tile.InstantVictory)
  }
}
