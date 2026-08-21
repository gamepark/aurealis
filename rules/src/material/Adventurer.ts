import { getEnumValues } from '@gamepark/rules-api'
import { AdventurerType } from './AdventurerType'

/**
 * The 52 Adventurer cards. The value encodes the main type: `mainType * 100 + n`, so the type of a
 * revealed card can be read from the id without a lookup.
 */
export enum Adventurer {
  // Naturalist
  Naturalist1 = 101,
  Naturalist2 = 102,
  Naturalist3 = 103,
  Naturalist4 = 104,
  Naturalist5 = 105,
  Naturalist6 = 106,
  Naturalist7 = 107,
  Naturalist8 = 108,
  Naturalist9 = 109,
  Naturalist10 = 110,
  Naturalist11 = 111,
  Naturalist12 = 112,
  Naturalist13 = 113,
  // Archaeologist
  Archaeologist1 = 201,
  Archaeologist2 = 202,
  Archaeologist3 = 203,
  Archaeologist4 = 204,
  Archaeologist5 = 205,
  Archaeologist6 = 206,
  Archaeologist7 = 207,
  Archaeologist8 = 208,
  Archaeologist9 = 209,
  Archaeologist10 = 210,
  Archaeologist11 = 211,
  Archaeologist12 = 212,
  Archaeologist13 = 213,
  // Explorer
  Explorer1 = 301,
  Explorer2 = 302,
  Explorer3 = 303,
  Explorer4 = 304,
  Explorer5 = 305,
  Explorer6 = 306,
  Explorer7 = 307,
  Explorer8 = 308,
  Explorer9 = 309,
  Explorer10 = 310,
  Explorer11 = 311,
  Explorer12 = 312,
  Explorer13 = 313,
  // ExpeditionLeader
  ExpeditionLeader1 = 401,
  ExpeditionLeader2 = 402,
  ExpeditionLeader3 = 403,
  ExpeditionLeader4 = 404,
  ExpeditionLeader5 = 405,
  ExpeditionLeader6 = 406,
  ExpeditionLeader7 = 407,
  ExpeditionLeader8 = 408,
  ExpeditionLeader9 = 409,
  ExpeditionLeader10 = 410,
  ExpeditionLeader11 = 411,
  ExpeditionLeader12 = 412,
  ExpeditionLeader13 = 413
}

export const adventurers = getEnumValues(Adventurer)

/**
 * The back of an Adventurer card is not a uniform pattern: it shows the card's main type as its
 * illustration and its secondary type on the corner flap, so an opponent facing the card stand reads
 * both without seeing the front. There are therefore 16 distinct backs, one per (main, secondary)
 * pair — that is why the card id is composite: two cards can share a back and differ on the front.
 *
 * The value encodes the pair: `mainType * 10 + secondaryType`.
 */
export enum AdventurerBack {
  NaturalistNaturalist = 11,
  NaturalistArchaeologist = 12,
  NaturalistExplorer = 13,
  NaturalistExpeditionLeader = 14,
  ArchaeologistNaturalist = 21,
  ArchaeologistArchaeologist = 22,
  ArchaeologistExplorer = 23,
  ArchaeologistExpeditionLeader = 24,
  ExplorerNaturalist = 31,
  ExplorerArchaeologist = 32,
  ExplorerExplorer = 33,
  ExplorerExpeditionLeader = 34,
  ExpeditionLeaderNaturalist = 41,
  ExpeditionLeaderArchaeologist = 42,
  ExpeditionLeaderExplorer = 43,
  ExpeditionLeaderExpeditionLeader = 44
}

/**
 * A card id: the back is always known — it is what the opponent sees — while the front is hidden in
 * the deck, in the river and in the other player's hand. `hideFront` / `hideFrontToOthers` strip
 * `id.front` and leave `id.back` in place.
 */
export type AdventurerId = {
  front?: Adventurer
  back: AdventurerBack
}

export const getMainType = (card: Adventurer): AdventurerType => Math.floor(card / 100)

export const getBackMainType = (back: AdventurerBack): AdventurerType => Math.floor(back / 10)

export const getBackSecondaryType = (back: AdventurerBack): AdventurerType => back % 10

/**
 * The secondary type of each card, read off the corner flap of its back.
 * Every main type has 13 cards, every secondary type appears 13 times, and each type pairs with
 * itself 4 times and with each of the 3 others 3 times (4 + 3 x 3 = 13).
 */
export const adventurerSecondaryType: Record<Adventurer, AdventurerType> = {
  [Adventurer.Naturalist1]: AdventurerType.Naturalist,
  [Adventurer.Naturalist2]: AdventurerType.Naturalist,
  [Adventurer.Naturalist3]: AdventurerType.Naturalist,
  [Adventurer.Naturalist4]: AdventurerType.Explorer,
  [Adventurer.Naturalist5]: AdventurerType.Naturalist,
  [Adventurer.Naturalist6]: AdventurerType.Explorer,
  [Adventurer.Naturalist7]: AdventurerType.ExpeditionLeader,
  [Adventurer.Naturalist8]: AdventurerType.ExpeditionLeader,
  [Adventurer.Naturalist9]: AdventurerType.Archaeologist,
  [Adventurer.Naturalist10]: AdventurerType.ExpeditionLeader,
  [Adventurer.Naturalist11]: AdventurerType.Archaeologist,
  [Adventurer.Naturalist12]: AdventurerType.Archaeologist,
  [Adventurer.Naturalist13]: AdventurerType.Explorer,
  [Adventurer.Archaeologist1]: AdventurerType.Explorer,
  [Adventurer.Archaeologist2]: AdventurerType.Naturalist,
  [Adventurer.Archaeologist3]: AdventurerType.Naturalist,
  [Adventurer.Archaeologist4]: AdventurerType.Naturalist,
  [Adventurer.Archaeologist5]: AdventurerType.ExpeditionLeader,
  [Adventurer.Archaeologist6]: AdventurerType.ExpeditionLeader,
  [Adventurer.Archaeologist7]: AdventurerType.ExpeditionLeader,
  [Adventurer.Archaeologist8]: AdventurerType.Archaeologist,
  [Adventurer.Archaeologist9]: AdventurerType.Archaeologist,
  [Adventurer.Archaeologist10]: AdventurerType.Archaeologist,
  [Adventurer.Archaeologist11]: AdventurerType.Explorer,
  [Adventurer.Archaeologist12]: AdventurerType.Archaeologist,
  [Adventurer.Archaeologist13]: AdventurerType.Explorer,
  [Adventurer.Explorer1]: AdventurerType.Explorer,
  [Adventurer.Explorer2]: AdventurerType.Explorer,
  [Adventurer.Explorer3]: AdventurerType.Naturalist,
  [Adventurer.Explorer4]: AdventurerType.Archaeologist,
  [Adventurer.Explorer5]: AdventurerType.ExpeditionLeader,
  [Adventurer.Explorer6]: AdventurerType.ExpeditionLeader,
  [Adventurer.Explorer7]: AdventurerType.Naturalist,
  [Adventurer.Explorer8]: AdventurerType.Explorer,
  [Adventurer.Explorer9]: AdventurerType.Naturalist,
  [Adventurer.Explorer10]: AdventurerType.Archaeologist,
  [Adventurer.Explorer11]: AdventurerType.Archaeologist,
  [Adventurer.Explorer12]: AdventurerType.ExpeditionLeader,
  [Adventurer.Explorer13]: AdventurerType.Explorer,
  [Adventurer.ExpeditionLeader1]: AdventurerType.Naturalist,
  [Adventurer.ExpeditionLeader2]: AdventurerType.Archaeologist,
  [Adventurer.ExpeditionLeader3]: AdventurerType.Archaeologist,
  [Adventurer.ExpeditionLeader4]: AdventurerType.Archaeologist,
  [Adventurer.ExpeditionLeader5]: AdventurerType.ExpeditionLeader,
  [Adventurer.ExpeditionLeader6]: AdventurerType.ExpeditionLeader,
  [Adventurer.ExpeditionLeader7]: AdventurerType.ExpeditionLeader,
  [Adventurer.ExpeditionLeader8]: AdventurerType.ExpeditionLeader,
  [Adventurer.ExpeditionLeader9]: AdventurerType.Naturalist,
  [Adventurer.ExpeditionLeader10]: AdventurerType.Naturalist,
  [Adventurer.ExpeditionLeader11]: AdventurerType.Explorer,
  [Adventurer.ExpeditionLeader12]: AdventurerType.Explorer,
  [Adventurer.ExpeditionLeader13]: AdventurerType.Explorer
}

export const getSecondaryType = (card: Adventurer): AdventurerType => adventurerSecondaryType[card]

/** The back a card always shows. Derived, so a card and its back can never fall out of step. */
export const getAdventurerBack = (card: Adventurer): AdventurerBack =>
  getMainType(card) * 10 + getSecondaryType(card)

export const getAdventurerId = (card: Adventurer): AdventurerId => ({
  front: card,
  back: getAdventurerBack(card)
})
