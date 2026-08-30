import { isCustomMoveType, isMoveItemType } from '@gamepark/rules-api'
import { archaeologistsAtCamp, archaeologistsOnSlots, extraArchaeologistsOn } from '../material/Archaeologists'
import { freeArchaeologistSlots, hasDigSite, playerJungleCards } from '../material/JungleState'
import { MaterialType } from '../material/MaterialType'
import { AurealisRules } from '../AurealisRules'
import { AurealisMove } from '../rules/AurealisRule'
import { CustomMoveType } from '../rules/CustomMoveType'

/**
 * Where the automatic player walks and sends its Archaeologists.
 *
 * Everything else the bot decides by playing the move out and pricing the position it leads to (see
 * {@link evaluate}). The pawns are the one thing that measure reads badly: a slot filled pays only
 * once the whole card is filled, so a number that prices positions finds a step here and a step
 * there worth about the same, and the team spreads over the row instead of finishing anything.
 *
 * So the pawns are not weighed, they are marched. The row is worked from the left, one card at a
 * time, and the orders are these:
 *
 * - the team walks to the goal, which is the first card of the row with a printed slot still to
 *   fill: that is the card being completed, and cards are completed from the left;
 * - a pawn standing on a printed slot of a card whose Dig Site is not built yet is building it, and
 *   is never taken off. The ones gathered in the middle of a card, and the ones waiting at the Camp
 *   de base, are the ones free to walk;
 * - a pawn never walks left. The row grows rightwards, a slot filled never frees up again, and
 *   nothing at the camp is ever worth going back for;
 * - the pawns walk one at a time, and it is always the one closest to the goal that takes the step:
 *   one pawn brought in is a slot filled, four pawns each one card further in is nothing at all;
 * - with every card of the row done, there is no goal left to reach and the pawns walk right all the
 *   same, as far as the row goes: a card walked is a card the team no longer has to walk when the
 *   next one is bought.
 *
 * Sending Archaeologists is the exception (rulebook p.12): distance costs nothing there, so the free
 * ride goes to the card the walk would never reach — the last one that still has a slot to fill —
 * and it is the pawn furthest back that takes it, since it is the one giving up the least.
 */

/** The Camp de base: the place before the first Jungle card of the row. */
const CAMP = -1

/** One of the player's Archaeologists: where it stands, and whether it may be taken from there. */
type Pawn = {
  index: number
  /** Its place in the row, the Camp de base being -1. */
  at: number
  /**
   * Free to leave: waiting at the camp, or gathered in the middle of a card. A pawn on a printed
   * slot of a card with no Dig Site on it yet is building that Dig Site, and taking it off is
   * undoing the work.
   */
  free: boolean
}

/** The row of a player, and their whole team, read the way the orders above have to read them. */
type Row = {
  /** The player's Jungle cards, left to right. */
  cards: number[]
  /** The card the team is walking to, past the end of the row when every card is done. */
  goal: number
  pawns: Pawn[]
}

const readRow = (rules: AurealisRules, player: number): Row => {
  const cards = playerJungleCards(rules, player)
    .sort((card) => card.location.x ?? 0)
    .getIndexes()
  const toFill = cards.map((card) => freeArchaeologistSlots(rules, card) > 0)
  const pawns: Pawn[] = archaeologistsAtCamp(rules, player)
    .getIndexes()
    .map((index) => ({ index, at: CAMP, free: true }))
  cards.forEach((card, position) => {
    const digSite = hasDigSite(rules, card)
    for (const index of extraArchaeologistsOn(rules, card).getIndexes()) pawns.push({ index, at: position, free: true })
    for (const index of archaeologistsOnSlots(rules, card).getIndexes()) pawns.push({ index, at: position, free: digSite })
  })
  const goal = toFill.indexOf(true)
  return { cards, goal: goal < 0 ? cards.length : goal, pawns }
}

/** The card a pawn is sent to: the last one of the row with a slot to fill, or simply the last one. */
const sendTarget = (rules: AurealisRules, row: Row): number => {
  for (let position = row.cards.length - 1; position >= 0; position--) {
    if (freeArchaeologistSlots(rules, row.cards[position]) > 0) return position
  }
  return row.cards.length - 1
}

/** The one legal move that walks or sends that pawn onto that card. */
const pawnMove = (legal: AurealisMove[], pawn: number, card: number): AurealisMove | undefined =>
  legal.find((move) => isMoveItemType(MaterialType.ArchaeologistPawn)(move) && move.itemIndex === pawn && move.location.parent === card)

/**
 * The pawn that takes the next step, and the card it steps onto: the one closest to the goal among
 * those free to walk, since it is the one whose step is worth the most. Pawns already at the goal or
 * beyond it stay where they are — the step they could take is a step away from the card being filled.
 */
const nextStep = (row: Row): { pawn: number, card: number } | undefined => {
  const last = row.cards.length - 1
  const walkers = row.pawns.filter((pawn) => pawn.free && pawn.at < row.goal && pawn.at < last)
  if (!walkers.length) return undefined
  const closest = walkers.reduce((best, pawn) => (pawn.at > best.at ? pawn : best))
  return { pawn: closest.index, card: row.cards[closest.at + 1] }
}

/**
 * One Archaeologist move spent, or the gain closed when there is no step worth taking: what is left
 * of it is cashed in as gold where the effect allows it, and given up where it does not.
 */
export const walkArchaeologist = (rules: AurealisRules, player: number, legal: AurealisMove[]): AurealisMove | undefined => {
  const step = nextStep(readRow(rules, player))
  const move = step && pawnMove(legal, step.pawn, step.card)
  return move ?? legal.find(isCustomMoveType(CustomMoveType.GainGold)) ?? legal.find(isCustomMoveType(CustomMoveType.Pass))
}

/**
 * One Archaeologist sent anywhere: the pawn furthest back onto the last card of the row that still
 * has a slot to fill. Nothing is declined here, so a team with every pawn on a slot has to break one
 * up all the same: the pawn taken is then the one furthest from the goal, whose card is the last the
 * player will get to.
 */
export const sendArchaeologist = (rules: AurealisRules, player: number, legal: AurealisMove[]): AurealisMove | undefined => {
  const row = readRow(rules, player)
  if (!row.cards.length) return undefined
  const target = sendTarget(rules, row)
  const leaving = row.pawns.filter((pawn) => pawn.at !== target)
  if (!leaving.length) return undefined
  const free = leaving.filter((pawn) => pawn.free)
  const sent = free.length
    ? free.reduce((best, pawn) => (pawn.at < best.at ? pawn : best))
    : leaving.reduce((best, pawn) => (pawn.at > best.at ? pawn : best))
  return pawnMove(legal, sent.index, row.cards[target])
}
