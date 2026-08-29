import { getEnumValues } from '@gamepark/rules-api'
import { buyJungle, Effect, gold, moves, placeAnimals } from './Effect'
import { LocationType } from './LocationType'
import { MaterialSource } from './MaterialSource'
import { MaterialType } from './MaterialType'

/**
 * The 4 Camp de base cards. One is drawn at random per player; they are purely cosmetic variants,
 * nothing in the game tells players apart (see the absence of a player identity in AurealisOptions).
 *
 * A simple id, like Jungle cards: face A (the improved one, used from the start of the game) and
 * face B (the standard one, identical in effect for every player) are the two sides of one card.
 */
export enum BaseCamp {
  BaseCamp1 = 1,
  BaseCamp2,
  BaseCamp3,
  BaseCamp4
}

export const baseCamps = getEnumValues(BaseCamp)

/**
 * The Camp de base a player was dealt. It changes nothing to how they play, which is why the rules
 * never ask: the display does, because that card is the one thing on the table that is this player's
 * and no one else's, and its colour is what their panel is painted with (see PlayerPanels).
 */
export const playerBaseCamp = (source: MaterialSource, player: number): BaseCamp | undefined =>
  source.material(MaterialType.BaseCampCard).location(LocationType.BaseCamp).player(player).getItem<BaseCamp>()?.id

/**
 * The four powers of a Camp de base card (rulebook p.9). Each of them costs the whole turn and 3
 * Adventurer cards discarded from the hand.
 *
 * The four are the same for every player, except for one: on its face A, each Camp de base has one
 * of the four on a light background, improved, and a different one on each card. Using that one is
 * what turns the card onto its face B, where the four powers are the common ones again — so the
 * improvement is worth exactly one use, at the moment of the player's choosing.
 */
export enum BaseCampPower {
  Gold = 1,
  Animal,
  Moves,
  Jungle
}

/** The 3 Adventurer cards a Camp de base action always costs. */
export const BASE_CAMP_COST = 3

const standardPowers: Record<BaseCampPower, Effect[]> = {
  [BaseCampPower.Gold]: [gold(3)],
  [BaseCampPower.Animal]: [placeAnimals(1)],
  [BaseCampPower.Moves]: [moves(3)],
  [BaseCampPower.Jungle]: [buyJungle(7)]
}

/**
 * The power each Camp de base improves on its face A, read off the light background of the cards:
 * one more of what the slot gives, or, for the Jungle card, 2 gold off its price.
 */
const improvedPowers: Record<BaseCamp, { power: BaseCampPower, effects: Effect[] }> = {
  [BaseCamp.BaseCamp1]: { power: BaseCampPower.Gold, effects: [gold(5)] },
  [BaseCamp.BaseCamp2]: { power: BaseCampPower.Animal, effects: [placeAnimals(2)] },
  [BaseCamp.BaseCamp3]: { power: BaseCampPower.Moves, effects: [moves(5)] },
  [BaseCamp.BaseCamp4]: { power: BaseCampPower.Jungle, effects: [buyJungle(5)] }
}

/** Whether that power, on that Camp de base, is the improved one — which is only true on face A. */
export const isImprovedPower = (camp: BaseCamp, power: BaseCampPower): boolean => improvedPowers[camp].power === power

export const getBaseCampPowerEffects = (camp: BaseCamp, power: BaseCampPower, improved: boolean): Effect[] =>
  improved ? improvedPowers[camp].effects : standardPowers[power]
