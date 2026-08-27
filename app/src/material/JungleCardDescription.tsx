import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons/faLocationDot'
import { faPaw } from '@fortawesome/free-solid-svg-icons/faPaw'
import { faPersonDigging } from '@fortawesome/free-solid-svg-icons/faPersonDigging'
import { faPersonHiking } from '@fortawesome/free-solid-svg-icons/faPersonHiking'
import { faSackDollar } from '@fortawesome/free-solid-svg-icons/faSackDollar'
import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { lastArchaeologistOn } from '@gamepark/aurealis/material/Archaeologists'
import { Jungle } from '@gamepark/aurealis/material/Jungle'
import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { Memory } from '@gamepark/aurealis/Memory'
import { CustomMoveType } from '@gamepark/aurealis/rules/CustomMoveType'
import { RuleId } from '@gamepark/aurealis/rules/RuleId'
import { CardDescription, ItemContext } from '@gamepark/react-game'
import { isCreateItemType, isMoveItemType, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { JUNGLE_DIG_SITE_BONUS } from '../locators/TableLayout'
import { ItemMenuAction, ItemMenuActions } from '../theme/ItemMenuActions'
import { JungleCardHelp } from './help/JungleCardHelp'
import { pileTopHelp } from './PileTopHelp'
import jungle1 from '../images/cards/jungle/Jungle1.jpg'
import jungle2 from '../images/cards/jungle/Jungle2.jpg'
import jungle3 from '../images/cards/jungle/Jungle3.jpg'
import jungle4 from '../images/cards/jungle/Jungle4.jpg'
import jungle5 from '../images/cards/jungle/Jungle5.jpg'
import jungle6 from '../images/cards/jungle/Jungle6.jpg'
import jungle7 from '../images/cards/jungle/Jungle7.jpg'
import jungle8 from '../images/cards/jungle/Jungle8.jpg'
import jungle9 from '../images/cards/jungle/Jungle9.jpg'
import jungle10 from '../images/cards/jungle/Jungle10.jpg'
import jungle11 from '../images/cards/jungle/Jungle11.jpg'
import jungle12 from '../images/cards/jungle/Jungle12.jpg'
import jungle13 from '../images/cards/jungle/Jungle13.jpg'
import jungle14 from '../images/cards/jungle/Jungle14.jpg'
import jungle15 from '../images/cards/jungle/Jungle15.jpg'
import jungle16 from '../images/cards/jungle/Jungle16.jpg'
import jungle17 from '../images/cards/jungle/Jungle17.jpg'
import jungle18 from '../images/cards/jungle/Jungle18.jpg'
import jungle19 from '../images/cards/jungle/Jungle19.jpg'
import jungle20 from '../images/cards/jungle/Jungle20.jpg'
import jungle1Back from '../images/cards/jungle/backs/Jungle1Back.jpg'
import jungle2Back from '../images/cards/jungle/backs/Jungle2Back.jpg'
import jungle3Back from '../images/cards/jungle/backs/Jungle3Back.jpg'
import jungle4Back from '../images/cards/jungle/backs/Jungle4Back.jpg'
import jungle5Back from '../images/cards/jungle/backs/Jungle5Back.jpg'
import jungle6Back from '../images/cards/jungle/backs/Jungle6Back.jpg'
import jungle7Back from '../images/cards/jungle/backs/Jungle7Back.jpg'
import jungle8Back from '../images/cards/jungle/backs/Jungle8Back.jpg'
import jungle9Back from '../images/cards/jungle/backs/Jungle9Back.jpg'
import jungle10Back from '../images/cards/jungle/backs/Jungle10Back.jpg'
import jungle11Back from '../images/cards/jungle/backs/Jungle11Back.jpg'
import jungle12Back from '../images/cards/jungle/backs/Jungle12Back.jpg'
import jungle13Back from '../images/cards/jungle/backs/Jungle13Back.jpg'
import jungle14Back from '../images/cards/jungle/backs/Jungle14Back.jpg'
import jungle15Back from '../images/cards/jungle/backs/Jungle15Back.jpg'
import jungle16Back from '../images/cards/jungle/backs/Jungle16Back.jpg'
import jungle17Back from '../images/cards/jungle/backs/Jungle17Back.jpg'
import jungle18Back from '../images/cards/jungle/backs/Jungle18Back.jpg'
import jungle19Back from '../images/cards/jungle/backs/Jungle19Back.jpg'
import jungle20Back from '../images/cards/jungle/backs/Jungle20Back.jpg'

/** The row of buttons, over the illustration and clear of the spaces printed down both edges. */
const BUTTON_Y = -3

/** Jungle cards are standard 63 x 88 mm. */
const WIDTH = 6.3
const HEIGHT = 8.8

/**
 * The Dig Site button stands under the space it fills rather than in the row: it is the one action of
 * a Jungle card whose place on the card is part of what it says. A player reading their row is asking
 * which card is one Archaeologist short of a Dig Site, and the button answers by pointing at the
 * space that is about to be taken.
 *
 * Left of the middle by {@link JUNGLE_DIG_SITE_BONUS}, whose box ends 3.91 cm below the middle of the
 * card, and astride the bottom edge at the height the Camp de base powers hang at: the cards of a
 * player's row all sit at the same y, so the buttons under them line up across the whole row.
 */
const DIG_SITE_BUTTON = { x: ((JUNGLE_DIG_SITE_BONUS.x - 50) / 100) * WIDTH, y: 4.8 }

/** One Archaeologist move is one card along the row, in either direction (see MoveArchaeologistsRule). */
const STEPS = [
  { step: -1, icon: faArrowLeft, title: 'button.move-left' },
  { step: 1, icon: faArrowRight, title: 'button.move-right' }
]

/**
 * The id of a Jungle card is a simple Jungle: both `images` and `backImages` are keyed by it, since
 * getFrontId and getBackId both return a non-object id as is.
 *
 * The verso is the *completed face*, turned over once the Dig Site and Animal bonuses are both taken
 * (rulebook p.5) — it is a game state, not hidden information. The default `isFlipped` keys off a
 * missing front, which never happens here, so the flip is driven by the location rotation instead.
 */
class JungleCardDescription extends CardDescription<number, MaterialType, LocationType, Jungle> {
  width = WIDTH
  height = HEIGHT

  /**
   * The buttons stand on the cards as soon as they can be pressed. A player facing their own row has
   * to compare the cards before touching any of them — which one is one Archaeologist short of a Dig
   * Site, which one has an Animal space left — and a menu that only opened on the card already
   * clicked would have them find that out one card at a time.
   */
  menuAlwaysVisible = true

  /** Its spaces and its three bonuses, and which of them are still to be had (see {@link JungleCardHelp}). */
  help = JungleCardHelp

  /**
   * The Jungle deck is face up and its top card is the third card of the market, so the pile is read
   * as that one card whichever of its cards the pointer landed on (see {@link pileTopHelp}).
   */
  displayHelp(item: MaterialItem<number, LocationType, Jungle>, context: ItemContext<number, MaterialType, LocationType>) {
    if (item.location.type === LocationType.JungleDeck) return pileTopHelp(item, context)
    return super.displayHelp(item, context)
  }

  /**
   * Everything a player may do to a Jungle card. Most of it is laid over the illustration at the top,
   * clear of everything printed on the card; building a Dig Site is the exception and stands under the
   * space it fills (see {@link DIG_SITE_BUTTON}).
   *
   * Never more than two at a time, and when there are two they are a pair: an Archaeologist walking
   * left or right, or the card a pawn was picked from beside the card it may be sent to.
   */
  getItemMenu(
    item: MaterialItem<number, LocationType, Jungle>,
    context: ItemContext<number, MaterialType, LocationType>,
    legalMoves: MaterialMove<number, MaterialType, LocationType>[]
  ) {
    // No legal move at all means it is not this player's turn: nothing on the table is theirs to press.
    if (!legalMoves.length) return null
    // A card of the deck is buried under the pile, where a button has nowhere to stand: the 3 cards
    // at its bottom are picked in a dialog of their own (see {@link DeckBottomJungleDialog}).
    if (item.location.type === LocationType.JungleDeck) return null
    const actions = [...this.actionMenu(context, legalMoves), ...this.archaeologistMenu(item, context, legalMoves)]
    if (!actions.length) return null
    return <ItemMenuActions actions={actions} y={BUTTON_Y} />
  }

  /** The three things a whole card is picked for: it is bought, it is dug, or an Animal lands on it. */
  private actionMenu(
    context: ItemContext<number, MaterialType, LocationType>,
    legalMoves: MaterialMove<number, MaterialType, LocationType>[]
  ): ItemMenuAction[] {
    const card = context.index
    const buy = legalMoves.find((move) => isMoveItemType(MaterialType.JungleCard)(move) && move.itemIndex === card)
    if (buy) return [{ move: buy, icon: faSackDollar, title: 'button.buy-jungle' }]
    const digSite = legalMoves.find((move) => isCreateItemType(MaterialType.DigSitePawn)(move) && move.item.location.parent === card)
    if (digSite) return [{ move: digSite, icon: faPersonDigging, title: 'button.build-dig-site', ...DIG_SITE_BUTTON }]
    const animal = legalMoves.find(
      (move) =>
        isCreateItemType(MaterialType.AnimalPawn)(move) && move.item.location.type === LocationType.JungleAnimalSpace && move.item.location.parent === card
    )
    if (animal) return [{ move: animal, icon: faPaw, title: 'button.place-animal' }]
    return []
  }

  /**
   * Moving the Archaeologists, which is never asked pawn by pawn: the button belongs to the card and
   * takes the last pawn to have reached it (see {@link lastArchaeologistOn}). Two pawns of a same
   * card are the same piece, and a row of 7 buttons would be 7 ways of doing one thing.
   *
   * One step at a time is one button per direction. Sending one anywhere is two clicks instead — the
   * card it leaves, then the card it lands on — the first of which never leaves this player's screen
   * (see {@link CustomMoveType.SelectArchaeologist}).
   */
  private archaeologistMenu(
    item: MaterialItem<number, LocationType, Jungle>,
    context: ItemContext<number, MaterialType, LocationType>,
    legalMoves: MaterialMove<number, MaterialType, LocationType>[]
  ): ItemMenuAction[] {
    const rules = context.rules as AurealisRules
    const card = context.index
    const pawn = lastArchaeologistOn(rules, card)
    switch (rules.game.rule?.id as RuleId | undefined) {
      case RuleId.MoveArchaeologists:
        if (pawn === undefined) return []
        return STEPS.flatMap(({ step, icon, title }) => {
          const neighbour = this.neighbour(rules, item, step)
          if (neighbour === undefined) return []
          const move = legalMoves.find(
            (move) => isMoveItemType(MaterialType.ArchaeologistPawn)(move) && move.itemIndex === pawn && move.location.parent === neighbour
          )
          return move ? [{ move, icon, title }] : []
        })
      case RuleId.SendArchaeologists: {
        const actions: ItemMenuAction[] = []
        const selected = rules.remind<number | undefined>(Memory.SelectedArchaeologist)
        if (pawn !== undefined) {
          actions.push({
            move: rules.customMove(CustomMoveType.SelectArchaeologist, pawn),
            options: { local: true },
            icon: faPersonHiking,
            title: selected === pawn ? 'button.unselect-archaeologist' : 'button.select-archaeologist',
            highlight: selected === pawn
          })
        }
        // The destinations only open up once a pawn has been picked: before that every card of the row
        // is a destination for every pawn, and a single button would have to guess which one.
        if (selected !== undefined) {
          const arrival = legalMoves.find(
            (move) => isMoveItemType(MaterialType.ArchaeologistPawn)(move) && move.itemIndex === selected && move.location.parent === card
          )
          if (arrival) actions.push({ move: arrival, icon: faLocationDot, title: 'button.send-archaeologist' })
        }
        return actions
      }
      default:
        return []
    }
  }

  /** The card one step along its owner's row: the row is a sequence of x, so a neighbour is x plus or minus 1. */
  private neighbour(rules: AurealisRules, item: MaterialItem<number, LocationType, Jungle>, step: number): number | undefined {
    const x = (item.location.x ?? 0) + step
    return rules
      .material(MaterialType.JungleCard)
      .location(LocationType.PlayerJungle)
      .player(item.location.player)
      .filter((other) => other.location.x === x)
      .getIndexes()[0]
  }

  isFlipped(item: Partial<MaterialItem<number, LocationType, Jungle>>) {
    return !!item.location?.rotation
  }

  images = {
    [Jungle.Jungle1]: jungle1,
    [Jungle.Jungle2]: jungle2,
    [Jungle.Jungle3]: jungle3,
    [Jungle.Jungle4]: jungle4,
    [Jungle.Jungle5]: jungle5,
    [Jungle.Jungle6]: jungle6,
    [Jungle.Jungle7]: jungle7,
    [Jungle.Jungle8]: jungle8,
    [Jungle.Jungle9]: jungle9,
    [Jungle.Jungle10]: jungle10,
    [Jungle.Jungle11]: jungle11,
    [Jungle.Jungle12]: jungle12,
    [Jungle.Jungle13]: jungle13,
    [Jungle.Jungle14]: jungle14,
    [Jungle.Jungle15]: jungle15,
    [Jungle.Jungle16]: jungle16,
    [Jungle.Jungle17]: jungle17,
    [Jungle.Jungle18]: jungle18,
    [Jungle.Jungle19]: jungle19,
    [Jungle.Jungle20]: jungle20
  }

  backImages = {
    [Jungle.Jungle1]: jungle1Back,
    [Jungle.Jungle2]: jungle2Back,
    [Jungle.Jungle3]: jungle3Back,
    [Jungle.Jungle4]: jungle4Back,
    [Jungle.Jungle5]: jungle5Back,
    [Jungle.Jungle6]: jungle6Back,
    [Jungle.Jungle7]: jungle7Back,
    [Jungle.Jungle8]: jungle8Back,
    [Jungle.Jungle9]: jungle9Back,
    [Jungle.Jungle10]: jungle10Back,
    [Jungle.Jungle11]: jungle11Back,
    [Jungle.Jungle12]: jungle12Back,
    [Jungle.Jungle13]: jungle13Back,
    [Jungle.Jungle14]: jungle14Back,
    [Jungle.Jungle15]: jungle15Back,
    [Jungle.Jungle16]: jungle16Back,
    [Jungle.Jungle17]: jungle17Back,
    [Jungle.Jungle18]: jungle18Back,
    [Jungle.Jungle19]: jungle19Back,
    [Jungle.Jungle20]: jungle20Back
  }
}

export const jungleCardDescription = new JungleCardDescription()
