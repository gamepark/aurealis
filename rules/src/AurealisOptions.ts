import { OptionsSpecV2 } from '@gamepark/rules-api'

/**
 * This is the type of object that the game receives when a new game is started.
 * Aurealis has no player identity and no variant, so there is nothing to configure.
 */
export type AurealisOptions = object

/**
 * The option space of aurealis: structure only.
 *
 * Labels live in the game's presentation document, published beside its translations at
 * `/options/<locale>.json` and keyed by convention. Subscription and competitive gates live in
 * the platform database, so they can change without releasing the game again.
 *
 * The game has no `identities`: nothing in the box tells the players apart — the Archéologue
 * pawns are all one colour, and every component is either shared or lives in a player's own
 * space. Game Park assigns the player ids 1, 2, ... itself.
 */
export const AurealisOptionsSpecV2: OptionsSpecV2 = {
  specVersion: 2,
  players: { min: 2, max: 2 }
}
