import { LegendaryAnimal } from './LegendaryAnimal'

/**
 * Everything the game can give a player. The same list serves the Adventurer cards, the bonuses of
 * the Jungle cards, the Temple tiles and the Camp de base, because the box uses the very same icons
 * in all four places (rulebook p.12).
 *
 * An effect is either immediate — nothing to decide, the rules apply it — or it opens a rule where
 * the player spends what they were given. See {@link effectRule}.
 */
export enum EffectType {
  /** Take gold from the general supply. */
  Gold = 1,
  /** Move Archaeologist pawns, one card at a time. */
  ArchaeologistMoves,
  /** Each unit is either one Archaeologist move or one gold, split as the player likes. */
  MovesOrGold,
  /** Put Archaeologist pawns on any Jungle card, from the Camp de base or from another card. */
  SendArchaeologists,
  /** Take Animal pawns and put them on free Animal spaces, wherever the player likes. */
  PlaceAnimals,
  /** One Animal pawn on each of the player's Jungle cards. No choice: the cards are all served. */
  AnimalOnEachJungle,
  /** Buy a Jungle card. Free when the cost is 0. */
  BuyJungle,
  RelicTile,
  TempleTile,
  LegendaryAnimalTile,
  /** The slash printed between two gains on a card: one of them, the player picks which. */
  Choice,
  /**
   * Not printed anywhere: a bonus of a Jungle card that has fallen due and is waiting its turn in
   * the queue. See {@link JungleDue} and {@link AurealisRule.afterItemMove}.
   */
  JungleDue,
  /**
   * Not printed anywhere either: the improved power of a Camp de base being spent. It is queued
   * behind the gains of that power, so that the card only turns onto its face B once they have all
   * been handed over — the way the rulebook example reads it (rulebook p.9).
   */
  FlipBaseCamp
}

/**
 * The three bonuses a Jungle card gives up, each of them the whole of what falls due at once: the
 * pawns that move on the card, and the gains printed beside them (see {@link JungleBonuses}).
 */
export enum JungleDue {
  /** The Bonus Fouilles: the team that built the Site walks home. */
  DigSite = 1,
  /** The Bonus Animal: one pawn slides onto its space, the others go back to the supply. */
  Animal,
  /** The Bonus Exploration: the two bonus pawns leave the card, which turns onto its completed face. */
  Exploration
}

export type Effect =
  | { type: EffectType.Gold, gold: number }
  | { type: EffectType.ArchaeologistMoves, count: number }
  | { type: EffectType.MovesOrGold, count: number }
  | { type: EffectType.SendArchaeologists, count: number }
  | { type: EffectType.PlaceAnimals, count: number }
  | { type: EffectType.AnimalOnEachJungle }
  | { type: EffectType.BuyJungle, cost: number, fromDeckBottom?: boolean }
  | { type: EffectType.RelicTile }
  | { type: EffectType.TempleTile }
  | { type: EffectType.LegendaryAnimalTile, animal: LegendaryAnimal }
  | { type: EffectType.Choice, options: Effect[] }
  | { type: EffectType.JungleDue, card: number, bonus: JungleDue }
  | { type: EffectType.FlipBaseCamp }

/** One member of the {@link Effect} union, to type a rule against the effect it resolves. */
export type EffectOf<T extends EffectType> = Extract<Effect, { type: T }>

/**
 * Builders, so that the tables that describe the cards and the tiles read like the icons they
 * transcribe: `[moves(3), gold(3)]` is a card that offers both.
 */
export const gold = (gold: number): Effect => ({ type: EffectType.Gold, gold })
export const moves = (count: number): Effect => ({ type: EffectType.ArchaeologistMoves, count })
export const movesOrGold = (count: number): Effect => ({ type: EffectType.MovesOrGold, count })
export const sendArchaeologists = (count: number): Effect => ({ type: EffectType.SendArchaeologists, count })
export const placeAnimals = (count: number): Effect => ({ type: EffectType.PlaceAnimals, count })
export const animalOnEachJungle: Effect = { type: EffectType.AnimalOnEachJungle }
export const buyJungle = (cost: number, fromDeckBottom = false): Effect => ({ type: EffectType.BuyJungle, cost, fromDeckBottom })
export const relicTile: Effect = { type: EffectType.RelicTile }
export const templeTile: Effect = { type: EffectType.TempleTile }
export const legendaryAnimalTile = (animal: LegendaryAnimal): Effect => ({ type: EffectType.LegendaryAnimalTile, animal })
/** Two gains parted by a slash on the card: the player takes one or the other, never both. */
export const choice = (...options: Effect[]): Effect => ({ type: EffectType.Choice, options })
/** A bonus of a Jungle card taking its place in the queue, printed on no card. */
export const jungleDue = (card: number, bonus: JungleDue): Effect => ({ type: EffectType.JungleDue, card, bonus })
/** The Camp de base turning over, queued behind what its improved power gives. Printed on no card. */
export const flipBaseCamp: Effect = { type: EffectType.FlipBaseCamp }
