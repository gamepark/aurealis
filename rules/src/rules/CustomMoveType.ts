export enum CustomMoveType {
  /** Choosing one of the powers of one's Camp de base. Data: the {@link BaseCampPower}. */
  BaseCampPower = 1,
  /**
   * Giving up the Archaeologist moves still owed. The one gain the rulebook lets a player use only
   * in part: everything else it hands out is applied in full (see {@link MoveArchaeologistsRule}).
   */
  Pass,
  /** Picking one of the two gains a card offers on either side of a slash. Data: its index. */
  ChooseEffect,
  /**
   * Gaining gold. Data: the amount. The coins follow as its consequence, and the denominations they
   * are made of say nothing anyone wants to read: what a player gains is one amount, once, whether
   * it comes from a card, a tile or a handful of Archaeologist moves left unused.
   */
  GainGold,
  /**
   * Picking the Archaeologist to send next. Data: the index of the pawn.
   *
   * The only move of the game that never leaves the player's own screen (see
   * {@link AurealisRules.previewMove}): sending an Archaeologist onto any Jungle card takes two
   * clicks — the pawn, then where it goes — and the first of them decides nothing. The rules accept
   * every pawn wherever the selection stands, so the opponent has nothing to be told and the history
   * has nothing to write.
   */
  SelectArchaeologist
}
