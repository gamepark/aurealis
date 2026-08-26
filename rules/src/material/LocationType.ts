export enum LocationType {
  /** The 5 Adventurer cards a player holds on their card stand. Backs face the opponent. */
  PlayerHand = 1,
  /** The face-down Adventurer draw pile, between the two players. */
  AdventurerDeck,
  /** The 4 face-down Adventurer cards beside the deck. With the deck they form the "river" of 5 backs. */
  AdventurerRiver,
  /**
   * The cards a player is drawing at the end of their turn, laid just above their stand, still face
   * down — to themselves as well as to their opponent. "Sélectionnez vos cartes d'un seul coup, sans
   * les remplacer ni regarder leurs effets" (rulebook p.11): the 3 cards drawn after a Camp de base
   * action are picked among the same 5 backs, and one of them cannot be read before the next is
   * chosen. They all turn over together, once the hand is full.
   */
  DrawnCards,
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
  /** Discovery and Fame tiles won by a player: 7 of them ends the game. */
  PlayerTiles,
  /** A player's gold. One Coin item per denomination, each carrying a quantity. */
  PlayerCoins,

  /** The general supply everyone draws from: coins, Dig Site and Animal pawns, Relic and Legendary Animal tiles. */
  Reserve
}
