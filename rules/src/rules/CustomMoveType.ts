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
  GainGold
}
