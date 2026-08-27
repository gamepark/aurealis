export enum LocationType {
  /**
   * The 5 Adventurer cards a player holds on their card stand. Backs face the opponent.
   *
   * A card drawn at the end of a turn arrives here **rotated**, which means it is face down on the
   * stand: hidden from its owner as much as from the opponent (see {@link RefillHandRule}). The
   * rotation is lifted from all of them at once when the hand is full, and that is the only moment
   * of the game when a card on a stand is unreadable to the player holding it.
   */
  PlayerHand = 1,
  /** The face-down Adventurer draw pile, between the two players. */
  AdventurerDeck,
  /** The 4 face-down Adventurer cards beside the deck. With the deck they form the "river" of 5 backs. */
  AdventurerRiver,
  /**
   * Face-up discard, kept apart from the deck so the two piles stay distinguishable. A card being
   * played goes there straight away rather than waiting somewhere in between: the pile is face up,
   * so it lies on top of it in plain sight for as long as its effects are being resolved.
   */
  AdventurerDiscard,

  /** The face-up Jungle draw pile. */
  JungleDeck,
  /** The 2 Jungle cards beside the deck. With the deck they form the market of 3. */
  JungleMarket,
  /** A player's row of Jungle cards, growing rightwards from the Camp de base. `x` is the position. */
  PlayerJungle,

  /** The Camp de base card in front of a player's stand. */
  BaseCamp,
  /**
   * The Archaeologist pawns still waiting on a player's Camp de base: the 7 they start with, minus
   * those already sent into the jungle. Nothing is printed under them, they simply sit on the card.
   */
  BaseCampArchaeologists,

  /** Archaeologist slots printed on a Jungle card (`parent` is the card, `x` the slot). */
  JungleArchaeologistSpace,
  /**
   * The Archaeologists standing on a Jungle card outside its printed slots: the ones that arrived
   * once the slots were full, and the ones left on a card turned onto its completed face, which has
   * no slot at all. They gather in the middle of the card, the way the team waits on the Camp de
   * base — and for the same reason: they are on the card, but not on anything printed.
   */
  JungleExtraArchaeologists,
  /** Animal slots printed on a Jungle card (`parent` is the card, `x` the slot). */
  JungleAnimalSpace,
  /** The Dig Site bonus space of a Jungle card (`parent` is the card). */
  JungleDigSiteBonus,
  /** The Animal bonus space of a Jungle card (`parent` is the card). */
  JungleAnimalBonus,

  /** The 4 Temple tiles drawn for the game, under the Jungle market. */
  TempleTilesRow,
  /** The 4 Fame tiles, under the Temple tiles. Fame tiles move from one player to the other. */
  FameTilesRow,
  /**
   * Discovery and Fame tiles won by a player: 7 of them ends the game. An ordered row, `x` being the
   * order they were won in — one sequence for every kind of tile, since they are one material.
   */
  PlayerTiles,
  /** A player's gold. One Coin item per denomination, each carrying a quantity. */
  PlayerCoins,

  /**
   * The general supply everyone draws from: coins, Dig Site and Animal pawns, Relic and Legendary
   * Animal tiles, and the Instant Victory tile. The tiles keep one heap per kind, told apart by the
   * `id` of the location (see {@link TilePile}); the coins and the pawns have none, being static
   * items of their descriptions rather than items of the game.
   */
  Reserve
}
