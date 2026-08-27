import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight'
import { faChevronUp } from '@fortawesome/free-solid-svg-icons/faChevronUp'
import { faCoins } from '@fortawesome/free-solid-svg-icons/faCoins'
import { faPersonHiking } from '@fortawesome/free-solid-svg-icons/faPersonHiking'
import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { lastArchaeologistAtCamp } from '@gamepark/aurealis/material/Archaeologists'
import { BaseCamp, BaseCampPower, isImprovedPower } from '@gamepark/aurealis/material/BaseCamp'
import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { Memory } from '@gamepark/aurealis/Memory'
import { CustomMoveType } from '@gamepark/aurealis/rules/CustomMoveType'
import { RuleId } from '@gamepark/aurealis/rules/RuleId'
import { CardDescription, ItemContext } from '@gamepark/react-game'
import { isCustomMoveType, isMoveItemType, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { ItemMenuAction, ItemMenuActions } from '../theme/ItemMenuActions'
import baseCamp1A from '../images/cards/basecamps/BaseCamp1A.jpg'
import baseCamp1B from '../images/cards/basecamps/BaseCamp1B.jpg'
import baseCamp2A from '../images/cards/basecamps/BaseCamp2A.jpg'
import baseCamp2B from '../images/cards/basecamps/BaseCamp2B.jpg'
import baseCamp3A from '../images/cards/basecamps/BaseCamp3A.jpg'
import baseCamp3B from '../images/cards/basecamps/BaseCamp3B.jpg'
import baseCamp4A from '../images/cards/basecamps/BaseCamp4A.jpg'
import baseCamp4B from '../images/cards/basecamps/BaseCamp4B.jpg'

/**
 * Where the four powers are printed, measured on the artwork: the slots are 7.6 mm wide, their middles
 * sit 2.12 and 0.69 cm either side of the middle of the card, and the icons fill the band 2.75 to 3.65
 * cm below it — the card being 8.8 cm tall, its bottom edge is at 4.4.
 */
const POWER_X = 2.1
const POWER_ICONS_TOP = 2.75

/**
 * Four discs side by side under a card 6.3 cm wide had to be shrunk to 1.4 cm to fit, and even then
 * left only 1.5 mm of table between two of them: a thumb aimed at one of them reaches its neighbour
 * as often as not. So they are full size and split into two pairs — the outer two powers above the
 * band of icons, the inner two below it and pushed out past their own slots. Every disc has a
 * centimetre of table to itself, and 3 cm separate the two of a pair.
 */
const POWER_ABOVE_Y = POWER_ICONS_TOP - 1.15
const POWER_BELOW_Y = 4.8

/**
 * The four powers, in the order they are printed along the bottom of the card, each with the key of
 * what it gives and the chevron that points back at the icon it sets off — the card says what a power
 * does, the button says when. The two above the band aim straight down at their own slot; the two
 * below stand out past theirs, so their chevrons are tilted the ~30 degrees that brings them back
 * onto it.
 */
const POWERS = [
  { power: BaseCampPower.Gold, title: 'button.base-camp.gold', x: -POWER_X, y: POWER_ABOVE_Y, rotation: 180 },
  { power: BaseCampPower.Animal, title: 'button.base-camp.animal', x: -1.6, y: POWER_BELOW_Y, rotation: 30 },
  { power: BaseCampPower.Moves, title: 'button.base-camp.moves', x: 1.6, y: POWER_BELOW_Y, rotation: -30 },
  { power: BaseCampPower.Jungle, title: 'button.base-camp.jungle', x: POWER_X, y: POWER_ABOVE_Y, rotation: 180 }
]

/** Over the illustration, where the tents are: nothing is printed there. */
const BUTTON_Y = -3

/**
 * Same shape as a Jungle card. Face A (improved, used from the start of the game) is the front and
 * face B (standard) the back, so a rotated card is one that has been turned onto its B side.
 * As with Jungle cards nothing is hidden here, so the flip follows the location rotation.
 */
class BaseCampCardDescription extends CardDescription<number, MaterialType, LocationType, BaseCamp> {
  width = 6.3
  height = 8.8

  /**
   * The four powers are on the table from the start of a turn, beside the cards of the hand and the
   * Dig Sites that are ready: the three actions of a turn are one single choice (see ChooseActionRule),
   * so they have to be readable side by side rather than one click away from each other.
   */
  menuAlwaysVisible = true

  /**
   * The player's own Camp de base is where a turn starts and where what is left of it is cashed in:
   * the four powers along its foot, and above them whatever the effect being resolved still offers.
   */
  getItemMenu(
    item: MaterialItem<number, LocationType, BaseCamp>,
    context: ItemContext<number, MaterialType, LocationType>,
    legalMoves: MaterialMove<number, MaterialType, LocationType>[]
  ) {
    // No legal move at all means it is not this player's turn, and the opponent's camp is never theirs.
    if (!legalMoves.length || item.location.player !== context.player) return null
    const powers = this.powerMenu(item, legalMoves)
    const actions = this.campMenu(context, legalMoves)
    return (
      <>
        {!!powers.length && <ItemMenuActions actions={powers} />}
        {!!actions.length && <ItemMenuActions actions={actions} y={BUTTON_Y} />}
      </>
    )
  }

  /**
   * One button per power of the card, all four or none: they cost the same 3 Adventurer cards, so a
   * hand too short offers none of them (see ChooseActionRule).
   *
   * The improved one — the slot printed on a light background on face A, worth exactly one use — is
   * the one turned to gold: it is what a player has to notice before spending their Camp de base on
   * anything else (rulebook p.9).
   */
  private powerMenu(
    item: MaterialItem<number, LocationType, BaseCamp>,
    legalMoves: MaterialMove<number, MaterialType, LocationType>[]
  ): ItemMenuAction[] {
    const improved = !item.location.rotation
    return POWERS.flatMap(({ power, title, x, y, rotation }) => {
      const move = legalMoves.find((move) => isCustomMoveType(CustomMoveType.BaseCampPower)(move) && move.data === power)
      if (!move) return []
      return [{ move, icon: faChevronUp, title, x, y, rotation, highlight: improved && isImprovedPower(item.id!, power) }]
    })
  }

  /**
   * What an effect being resolved offers from the camp itself: the team still waiting there, and the
   * gold that Archaeologist moves can be taken as instead (see MoveArchaeologistsRule). Both end up
   * here because both are the camp's — the pawns stand on it, and the gold is what the expedition
   * takes home rather than walking any further.
   */
  private campMenu(
    context: ItemContext<number, MaterialType, LocationType>,
    legalMoves: MaterialMove<number, MaterialType, LocationType>[]
  ): ItemMenuAction[] {
    const rules = context.rules as AurealisRules
    const pawn = lastArchaeologistAtCamp(rules, context.player!)
    const actions: ItemMenuAction[] = []
    const gold = legalMoves.find(isCustomMoveType(CustomMoveType.GainGold))
    if (gold) actions.push({ move: gold, icon: faCoins, title: 'button.take-gold', label: String(gold.data) })
    if (pawn !== undefined) {
      switch (rules.game.rule?.id as RuleId | undefined) {
        // One move takes a pawn onto the first Jungle card of the row, the camp being the card before it.
        case RuleId.MoveArchaeologists: {
          const move = legalMoves.find((move) => isMoveItemType(MaterialType.ArchaeologistPawn)(move) && move.itemIndex === pawn)
          if (move) actions.push({ move, icon: faArrowRight, title: 'button.move-right' })
          break
        }
        // Picked here, sent from the Jungle card the player then presses (see JungleCardDescription).
        case RuleId.SendArchaeologists: {
          const selected = rules.remind<number | undefined>(Memory.SelectedArchaeologist)
          actions.push({
            move: rules.customMove(CustomMoveType.SelectArchaeologist, pawn),
            options: { local: true },
            icon: faPersonHiking,
            title: selected === pawn ? 'button.unselect-archaeologist' : 'button.select-archaeologist',
            highlight: selected === pawn
          })
          break
        }
      }
    }
    return actions
  }

  isFlipped(item: Partial<MaterialItem<number, LocationType, BaseCamp>>) {
    return !!item.location?.rotation
  }

  images = {
    [BaseCamp.BaseCamp1]: baseCamp1A,
    [BaseCamp.BaseCamp2]: baseCamp2A,
    [BaseCamp.BaseCamp3]: baseCamp3A,
    [BaseCamp.BaseCamp4]: baseCamp4A
  }

  backImages = {
    [BaseCamp.BaseCamp1]: baseCamp1B,
    [BaseCamp.BaseCamp2]: baseCamp2B,
    [BaseCamp.BaseCamp3]: baseCamp3B,
    [BaseCamp.BaseCamp4]: baseCamp4B
  }
}

export const baseCampCardDescription = new BaseCampCardDescription()
