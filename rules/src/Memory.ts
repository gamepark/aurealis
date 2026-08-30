/**
 * What the rules have to remember beyond the position of the material and the current rule.
 * Everything here belongs to the turn being played: nothing survives the end of an action but the
 * winner.
 */
export enum Memory {
  /** The effects the current action still owes the player, in the order they will be resolved. */
  PendingEffects = 1,
  /** The effect the rule in progress is resolving. It carries its own size, cost and options. */
  CurrentEffect,
  /** What is left of the current effect: moves to spend, pawns to place, cards to discard. */
  Remaining,
  /** Set when the game ends, since the rule that ended it is gone by the time players are ranked. */
  Winner,
  /**
   * The Archaeologist the player has picked but not yet sent (see
   * {@link CustomMoveType.SelectArchaeologist}). Local to whoever is playing: the server never hears
   * of it, and it is forgotten the moment the pawn lands.
   */
  SelectedArchaeologist,
  /**
   * How far the player was along each of the four Fame objectives when their turn started. Step III
   * compares the objectives against it: a Fame tile is only taken by a player who has gained
   * something towards it during their own turn (see {@link CheckFameRule}).
   */
  FameAtTurnStart
}
