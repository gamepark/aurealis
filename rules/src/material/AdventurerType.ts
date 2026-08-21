/**
 * The 4 kinds of Adventurer. Every Adventurer card has a main type, which decides the action it
 * always offers, and a secondary type, which often differs and adds a second effect.
 * Only the main type counts when checking a card's conditions (rulebook p.4).
 */
export enum AdventurerType {
  Naturalist = 1,
  Archaeologist,
  Explorer,
  ExpeditionLeader
}
