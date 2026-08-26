/**
 * The few numbers the setup and the rules both need: what a full table looks like, and what ends
 * the game. Everything else that is counted once, at setup time, stays in {@link AurealisSetup}.
 */

/** Cards a player holds on their stand, and refills to at the end of their turn (rulebook p.11). */
export const HAND_SIZE = 5
/** Adventurer cards laid beside the deck: with the deck's own back, the river shows 5 backs. */
export const RIVER_SIZE = 4
/** Jungle cards laid beside the deck: with the deck's face-up top card, the market shows 3. */
export const JUNGLE_MARKET_SIZE = 2
/** Discovery and Fame tiles in front of a player, at the start of their turn: the game is theirs. */
export const TILES_TO_WIN = 7
