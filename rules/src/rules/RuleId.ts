export enum RuleId {
  /**
   * Steps I and II of a turn: the end of the game is checked, then the player takes their single
   * action. The three actions are offered at once, without a first step to pick one of them —
   * playing a card, building a Dig Site and choosing a Camp de base power are each a move of their
   * own (rulebook p.6).
   */
  ChooseAction = 1,
  /** The 3 cards a Camp de base action costs, discarded after its power was chosen. */
  BaseCampDiscard,
  /**
   * Not a step of the rulebook: the queue of everything the action has yet to give the player.
   * It applies whatever needs no decision and hands over to the rule that does, one effect at a
   * time, until the action is over. Bonuses obtained along the way queue up behind.
   */
  ResolveEffects,
  /** Spending Archaeologist moves, one adjacent card at a time, some of which may be taken as gold. */
  MoveArchaeologists,
  /** Putting Archaeologist pawns on any Jungle card, from the Camp de base or from another card. */
  SendArchaeologists,
  /** Putting Animal pawns on the free Animal spaces of one's own Jungle cards. */
  PlaceAnimals,
  /** Taking a Jungle card, paid or free, from the market or from the bottom of the deck. */
  AcquireJungle,
  /** Choosing one of the Temple tiles on display, then applying its effect. */
  ChooseTempleTile,
  /**
   * Step III: the Fame tiles are given out and taken back. Nobody chooses anything, but it is a
   * step of its own all the same — a tile changing hands is worth a line of its own.
   */
  CheckFame,
  /** Step IV: the hand is refilled from the river, then the river and the Jungle market are too. */
  RefillHand
}
