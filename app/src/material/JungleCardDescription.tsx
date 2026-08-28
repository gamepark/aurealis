import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons/faLocationDot'
import { faPaw } from '@fortawesome/free-solid-svg-icons/faPaw'
import { faPersonDigging } from '@fortawesome/free-solid-svg-icons/faPersonDigging'
import { faPersonHiking } from '@fortawesome/free-solid-svg-icons/faPersonHiking'
import { faSackDollar } from '@fortawesome/free-solid-svg-icons/faSackDollar'
import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { lastArchaeologistAtCamp, lastArchaeologistOn } from '@gamepark/aurealis/material/Archaeologists'
import { EffectOf, EffectType } from '@gamepark/aurealis/material/Effect'
import { Jungle } from '@gamepark/aurealis/material/Jungle'
import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { Memory } from '@gamepark/aurealis/Memory'
import { CustomMoveType } from '@gamepark/aurealis/rules/CustomMoveType'
import { RuleId } from '@gamepark/aurealis/rules/RuleId'
import { CardDescription, ItemContext } from '@gamepark/react-game'
import { isCreateItemType, isCreateItemTypeAtOnce, isMoveItemType, isMoveItemTypeAtOnce, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { JUNGLE_DIG_SITE_BONUS, PLAYER_JUNGLE_GAP } from '../locators/TableLayout'
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
 * The Buy button stands in the top right corner rather than in the row: the Plant badges the Fame
 * objectives count are printed in the top *left* corner, up to two of them side by side, and a button
 * in the middle of the top edge lands on the second one (see `getPlantIcons`). The corner it takes
 * instead carries nothing but the white palm that says "Jungle card", which is the one thing a buyer
 * already knows about the card being bought.
 *
 * Half a button in from the top edge and from the right one, the button being 2.2 cm across.
 */
const BUY_BUTTON = { x: WIDTH / 2 - 1.35, y: -HEIGHT / 2 + 1.35 }

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

/**
 * One Archaeologist move is one card along the row, in either direction (see MoveArchaeologistsRule),
 * and each arrow stands on the border it crosses: half a step left of the middle of the card is
 * exactly the seam between it and the card before it.
 *
 * Every seam is carried by the card on its right, never by the one on its left. The Camp de base is
 * a card of the row like any other — it stands exactly one step left of the first Jungle card — so
 * the team setting out of the camp is walked from that first card, and the camp carries no arrow at
 * all.
 *
 * The three of them share the seam and are parted by height, 2.5 cm apart to clear the 2.2 cm of a
 * button. They read from the top down as one road between the two cards: the lane a whole team takes
 * at once, the same lane taken by one pawn alone, and the lane coming back underneath.
 *
 * The team goes on top because it is the only one of the three carrying a label, and a label stands
 * beside its button: anywhere lower it would lie over the card and hide what is printed there.
 */
const ARROW_X = -PLAYER_JUNGLE_GAP.x / 2
const ARROW_STEP = 2.5
const MOVE_RIGHT_TOGETHER = { x: ARROW_X, y: -ARROW_STEP }
const MOVE_RIGHT = { x: ARROW_X, y: 0 }
const MOVE_LEFT = { x: ARROW_X, y: ARROW_STEP }

/**
 * The two ways of putting Animal pawns on a card, one under the other in the middle of it, parted by
 * the same {@link ARROW_STEP} that clears a button.
 *
 * The one filling several spaces at once stands on top, where the single button stands when it is
 * alone: it is the one carrying a label, and a label needs the room over the illustration. Alone,
 * the single button keeps that place — a lone button in the middle of a card reads as "this card",
 * and nothing is gained by lowering it.
 */
const PLACE_ANIMALS_TOGETHER = { x: 0, y: BUTTON_Y }
const PLACE_ANIMAL_BELOW = { x: 0, y: BUTTON_Y + ARROW_STEP }

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
   * Never more than two or three at a time, and they always belong together: an Archaeologist walking
   * left or right, the card a pawn was picked from beside the card it may be sent to, or the same
   * pawns placed one at a time or several at once.
   */
  getItemMenu(
    item: MaterialItem<number, LocationType, Jungle>,
    context: ItemContext<number, MaterialType, LocationType>,
    legalMoves: MaterialMove<number, MaterialType, LocationType>[]
  ) {
    // No legal move at all means it is not this player's turn: nothing on the table is theirs to press.
    if (!legalMoves.length) return null
    if (item.location.type === LocationType.JungleDeck) return this.deckMenu(context, legalMoves)
    const actions = [...this.actionMenu(context, legalMoves), ...this.archaeologistMenu(item, context, legalMoves)]
    if (!actions.length) return null
    return <ItemMenuActions actions={actions} y={BUTTON_Y} />
  }

  /**
   * The Jungle deck, whose face-up top is the third card of the market: that one card is bought where
   * it lies, and carries the same Buy button as the two laid beside the pile.
   *
   * Nothing else on the pile carries anything. The cards under the top are a thickness drawn 0.5 mm
   * apart (see {@link StackLocator}), so a button of theirs would stand over the card on top and play
   * a move nobody can read there — which is the case of the 3 cards at the *bottom* a Temple tile
   * reaches for, and those are picked in a dialog of their own (see {@link DeckBottomJungleDialog}).
   */
  private deckMenu(context: ItemContext<number, MaterialType, LocationType>, legalMoves: MaterialMove<number, MaterialType, LocationType>[]) {
    const rules = context.rules as AurealisRules
    if (rules.remind<EffectOf<EffectType.BuyJungle> | undefined>(Memory.CurrentEffect)?.fromDeckBottom) return null
    const top = rules
      .material(MaterialType.JungleCard)
      .location(LocationType.JungleDeck)
      .maxBy((card) => card.location.x ?? 0)
    if (top.getIndex() !== context.index) return null
    const actions = this.actionMenu(context, legalMoves)
    if (!actions.length) return null
    return <ItemMenuActions actions={actions} />
  }

  /** The three things a whole card is picked for: it is bought, it is dug, or an Animal lands on it. */
  private actionMenu(
    context: ItemContext<number, MaterialType, LocationType>,
    legalMoves: MaterialMove<number, MaterialType, LocationType>[]
  ): ItemMenuAction[] {
    const card = context.index
    const buy = legalMoves.find((move) => isMoveItemType(MaterialType.JungleCard)(move) && move.itemIndex === card)
    if (buy) return [{ move: buy, icon: faSackDollar, title: 'button.buy-jungle', ...BUY_BUTTON }]
    const digSite = legalMoves.find((move) => isCreateItemType(MaterialType.DigSitePawn)(move) && move.item.location.parent === card)
    if (digSite) return [{ move: digSite, icon: faPersonDigging, title: 'button.build-dig-site', ...DIG_SITE_BUTTON }]
    return this.animalActions(card, legalMoves)
  }

  /**
   * The Animal pawns landing on this card: one, or as many as its free spaces can take in one go
   * (see PlaceAnimalsRule). The ×N is those N presses of the single button, so the two stand one
   * over the other rather than side by side — they are one action at two speeds, not a choice
   * between two things.
   */
  private animalActions(card: number, legalMoves: MaterialMove<number, MaterialType, LocationType>[]): ItemMenuAction[] {
    const animal = legalMoves.find(
      (move) =>
        isCreateItemType(MaterialType.AnimalPawn)(move) && move.item.location.type === LocationType.JungleAnimalSpace && move.item.location.parent === card
    )
    if (!animal) return []
    const together = legalMoves
      .filter(isCreateItemTypeAtOnce(MaterialType.AnimalPawn))
      .find((move) => move.items[0]?.location.type === LocationType.JungleAnimalSpace && move.items[0]?.location.parent === card)
    if (!together) return [{ move: animal, icon: faPaw, title: 'button.place-animal' }]
    return [
      {
        move: together,
        icon: faPaw,
        title: 'button.place-animals-together',
        titleValues: { count: together.items.length },
        label: `×${together.items.length}`,
        ...PLACE_ANIMALS_TOGETHER
      },
      { move: animal, icon: faPaw, title: 'button.place-animal', ...PLACE_ANIMAL_BELOW }
    ]
  }

  /**
   * Moving the Archaeologists, which is never asked pawn by pawn: a button takes the last pawn to
   * have reached the card it walks off (see {@link lastArchaeologistOn}). Two pawns of a same card
   * are the same piece, and a row of 7 buttons would be 7 ways of doing one thing.
   *
   * One step at a time is one button per direction, plus the one that walks a whole team a step to
   * the right at once and says how many that is (see MoveArchaeologistsRule): a player pushing into
   * the jungle moves the same pawns the same way several times over, and the ×3 is those three
   * presses.
   *
   * All three stand on the seam this card shares with the one before it, and all three are this
   * card's: the two rightwards ones walk a pawn *onto* it, from the card behind or from the Camp de
   * base. Sending one anywhere is two clicks instead — the card it leaves, then the card it lands on
   * — the first of which never leaves this player's screen (see
   * {@link CustomMoveType.SelectArchaeologist}).
   */
  private archaeologistMenu(
    item: MaterialItem<number, LocationType, Jungle>,
    context: ItemContext<number, MaterialType, LocationType>,
    legalMoves: MaterialMove<number, MaterialType, LocationType>[]
  ): ItemMenuAction[] {
    const rules = context.rules as AurealisRules
    const card = context.index
    // The Archaeologists only ever walk a player's own row: a card of the market is nobody's road yet.
    if (item.location.type !== LocationType.PlayerJungle) return []
    const pawn = lastArchaeologistOn(rules, card)
    switch (rules.game.rule?.id as RuleId | undefined) {
      case RuleId.MoveArchaeologists: {
        const actions: ItemMenuAction[] = []
        const behind = this.neighbour(rules, item, -1)
        // A whole team only ever walks right, so the one group arriving anywhere on the row is the
        // one coming from behind: the card it lands on is enough to tell it apart.
        const together = legalMoves.filter(isMoveItemTypeAtOnce(MaterialType.ArchaeologistPawn)).find((move) => move.location.parent === card)
        if (together) {
          actions.push({
            move: together,
            icon: faArrowRight,
            title: 'button.move-right-together',
            titleValues: { count: together.indexes.length },
            label: `×${together.indexes.length}`,
            ...MOVE_RIGHT_TOGETHER
          })
        }
        // The pawn walking onto this card: the last to have reached the card behind it, or the one
        // waiting at the Camp de base when this is the first card of the row.
        const arriving = behind !== undefined ? lastArchaeologistOn(rules, behind) : lastArchaeologistAtCamp(rules, item.location.player!)
        if (arriving !== undefined) {
          const move = legalMoves.find(
            (move) => isMoveItemType(MaterialType.ArchaeologistPawn)(move) && move.itemIndex === arriving && move.location.parent === card
          )
          if (move) actions.push({ move, icon: faArrowRight, title: 'button.move-right', ...MOVE_RIGHT })
        }
        // Backwards, which stops at the first Jungle card: a pawn never walks back to the camp.
        if (pawn !== undefined && behind !== undefined) {
          const move = legalMoves.find(
            (move) => isMoveItemType(MaterialType.ArchaeologistPawn)(move) && move.itemIndex === pawn && move.location.parent === behind
          )
          if (move) actions.push({ move, icon: faArrowLeft, title: 'button.move-left', ...MOVE_LEFT })
        }
        return actions
      }
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
