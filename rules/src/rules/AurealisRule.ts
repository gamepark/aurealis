import {
  CustomMove,
  isCreateItem,
  isCreateItemsAtOnce,
  isCustomMoveType,
  isMoveItem,
  isMoveItemsAtOnce,
  ItemMove,
  Location,
  Material,
  MaterialMove,
  PlayerTurnRule
} from '@gamepark/rules-api'
import {
  archaeologistsAtCamp,
  archaeologistsOn,
  archaeologistsOnSlots,
  extraArchaeologistsOn
} from '../material/Archaeologists'
import { coins, playerGold } from '../material/Coin'
import { adventurerDeckTop, adventurerRiver, getCardsInPlay } from '../material/CardsInPlay'
import { CardsInPlay } from '../material/Condition'
import { Effect, EffectOf, EffectType, jungleDue, JungleDue } from '../material/Effect'
import { getAnimalSpaces, getArchaeologistSpaces, getJungleBonuses, Jungle } from '../material/Jungle'
import {
  animalPawnsOn,
  freeAnimalSpaces,
  freeArchaeologistSlots,
  hasAnimalBonus,
  hasDigSite,
  isCompletedJungle,
  playerJungleCards
} from '../material/JungleState'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { countPlayerTiles } from '../material/PlayerTiles'
import { Memory } from '../Memory'
import { CustomMoveType } from './CustomMoveType'
import { RuleId } from './RuleId'

export type AurealisMove = MaterialMove<number, MaterialType, LocationType, RuleId>
export type AurealisItemMove = ItemMove<number, MaterialType, LocationType>
export type AurealisMaterial = Material<number, MaterialType, LocationType>

/** The two places an Archaeologist can stand on a Jungle card: a printed slot, or the middle of it. */
export const isOnJungleCard = (type?: LocationType): boolean =>
  type === LocationType.JungleArchaeologistSpace || type === LocationType.JungleExtraArchaeologists

/** Where an item move puts the item, whether it creates it there or brings it from somewhere else. */
const destination = (move: AurealisItemMove): Partial<Location<number, LocationType>> | undefined => {
  if (isCreateItem(move)) return move.item.location
  // Items are only ever created at once to fill one place: the Animal spaces of a single card.
  if (isCreateItemsAtOnce(move)) return move.items[0]?.location
  if (isMoveItem(move) || isMoveItemsAtOnce(move)) return move.location
  return undefined
}

/**
 * What every step of the rules shares: the way the material is read, and the two things that run
 * across a whole turn — the queue of effects the action still owes the player, and the bonuses of a
 * Jungle card, which no step of the rules triggers on purpose: they fall due the moment a pawn lands
 * on the space that unlocks them, whichever rule put it there.
 */
export abstract class AurealisRule extends PlayerTurnRule<number, MaterialType, LocationType, RuleId> {
  /** Aurealis is played by exactly 2 players, so the next player is the opponent. */
  get opponent(): number {
    return this.nextPlayer
  }

  // ------------------------------------------------------------------ Adventurer cards

  get adventurers(): AurealisMaterial {
    return this.material(MaterialType.AdventurerCard)
  }

  hand(player: number = this.player): AurealisMaterial {
    return this.adventurers.location(LocationType.PlayerHand).player(player)
  }

  get adventurerDeck(): AurealisMaterial {
    return this.adventurers.location(LocationType.AdventurerDeck)
  }

  get adventurerDeckTop(): AurealisMaterial {
    return adventurerDeckTop(this)
  }

  get river(): AurealisMaterial {
    return adventurerRiver(this)
  }

  get cardsInPlay(): CardsInPlay {
    return getCardsInPlay(this, this.player, this.opponent)
  }

  // ------------------------------------------------------------------ Jungle cards

  jungleCards(player: number = this.player): AurealisMaterial {
    return playerJungleCards(this, player)
  }

  get jungleDeck(): AurealisMaterial {
    return this.material(MaterialType.JungleCard).location(LocationType.JungleDeck)
  }

  get jungleDeckTop(): AurealisMaterial {
    return this.jungleDeck.maxBy((item) => item.location.x ?? 0)
  }

  /** The market of 3: the 2 cards laid beside the Jungle deck, and the face-up top of the deck. */
  get jungleMarket(): AurealisMaterial {
    const beside = this.material(MaterialType.JungleCard).location(LocationType.JungleMarket).getIndexes()
    return this.material(MaterialType.JungleCard).index([...beside, ...this.jungleDeckTop.getIndexes()])
  }

  /** A card turned onto its completed face has no space left on it: nothing can be put there again. */
  isCompleted(card: { location: Location<number, LocationType> }): boolean {
    return isCompletedJungle(card)
  }

  /**
   * The pawn sitting on the Bonus Animal space is the record that the bonus was obtained
   * (rulebook p.5): the spaces of the card are then emptied for good, and nothing goes back on them.
   */
  hasAnimalBonus(card: number): boolean {
    return hasAnimalBonus(this, card)
  }

  freeAnimalSpaces(card: number): number {
    return freeAnimalSpaces(this, card)
  }

  /**
   * The player's Jungle cards that can still take an Animal pawn, read left to right.
   *
   * Sorted on `x`, which is where the row is laid out and has nothing to do with the order of the
   * indexes: those are the order the cards were printed in, and a card bought late in the game lands
   * at the end of the row with whatever index it was born with. An effect that serves every card at
   * once serves them the way a hand would, from the Camp de base outwards.
   */
  get jungleCardsWithFreeAnimalSpace(): number[] {
    return this.jungleCards()
      .sort((card) => card.location.x ?? 0)
      .getIndexes()
      .filter((card) => this.freeAnimalSpaces(card) > 0)
  }

  animalPawnsOn(card: number): AurealisMaterial {
    return animalPawnsOn(this, card)
  }

  /**
   * Where the Archaeologists stand. Asked through {@link Archaeologists} rather than answered here,
   * because the display puts the very same questions to decide which pawn each of its buttons moves.
   */
  get campArchaeologists(): AurealisMaterial {
    return archaeologistsAtCamp(this, this.player)
  }

  /** The Archaeologists standing on the printed slots of the card: only they build a Dig Site. */
  archaeologistsOnSlots(card: number): AurealisMaterial {
    return archaeologistsOnSlots(this, card)
  }

  /** The ones standing on the card outside its slots, gathered in the middle of it. */
  extraArchaeologistsOn(card: number): AurealisMaterial {
    return extraArchaeologistsOn(this, card)
  }

  /** Every Archaeologist on the card, slots or not: they can all leave it again. */
  archaeologistsOn(card: number): number[] {
    return archaeologistsOn(this, card)
  }

  /**
   * Where an Archaeologist sent onto that card lands: on the first free printed slot, or in the
   * middle of the card once there is no slot worth taking.
   */
  archaeologistDestination(card: number): Location<number, LocationType> {
    return { type: this.freeArchaeologistSlots(card) > 0 ? LocationType.JungleArchaeologistSpace : LocationType.JungleExtraArchaeologists, parent: card }
  }

  /**
   * How many printed slots of the card are still worth standing on. Filling them is the one thing
   * they are for — a Dig Site is built by taking them all (rulebook p.7) — so a card that can no
   * longer be dug counts none of them, whether or not it still has one drawn on it.
   *
   * Which is the case of a card whose Dig Site has already been built, as much as of one turned onto
   * its completed face: the pawn on its Bonus Fouilles stays there for good, and it is what closes
   * the card to a second Dig Site. The team gathers in the middle instead, where it stays out of the
   * way of nothing and reads as what it is — Archaeologists passing through.
   */
  freeArchaeologistSlots(card: number): number {
    return freeArchaeologistSlots(this, card)
  }

  /** The Bonus Fouilles of the card taken: its Dig Site has been built, and never will be again. */
  hasDigSite(card: number): boolean {
    return hasDigSite(this, card)
  }

  /** All the Archaeologist slots of the card taken: what the Dig Site action asks for (rulebook p.7). */
  isDigSiteReady(card: number): boolean {
    const item = this.material(MaterialType.JungleCard).getItem<Jungle>(card)
    if (this.isCompleted(item) || this.hasDigSite(card)) return false
    return this.archaeologistsOnSlots(card).length >= getArchaeologistSpaces(item.id)
  }

  // ------------------------------------------------------------------ the Camp de base

  /** The player's own Camp de base card, face A while its improved power is still there to spend. */
  get baseCamp(): AurealisMaterial {
    return this.material(MaterialType.BaseCampCard).location(LocationType.BaseCamp).player(this.player)
  }

  // ------------------------------------------------------------------ gold and tiles

  playerCoins(player: number = this.player): AurealisMaterial {
    return this.material(MaterialType.Coin).location(LocationType.PlayerCoins).player(player)
  }

  get gold(): number {
    return playerGold(this, this.player)
  }

  /**
   * The move that says "this player gains that much gold". The coins themselves follow as its
   * consequence: they are only a way of counting, and the history has one line to write.
   */
  takeGold(amount: number): AurealisMove {
    return this.customMove(CustomMoveType.GainGold, amount)
  }

  /** The coins an amount is made of, in the fewest pieces the supply can give. */
  gainGold(amount: number): AurealisMove[] {
    return this.playerCoins().money(coins).addMoney(amount, { type: LocationType.PlayerCoins, player: this.player })
  }

  /** Wherever gold is gained from, the coins are counted out here. */
  onCustomMove(move: CustomMove): AurealisMove[] {
    return isCustomMoveType(CustomMoveType.GainGold)(move) ? this.gainGold(move.data as number) : []
  }

  payGold(amount: number): AurealisMove[] {
    return this.playerCoins().money(coins).removeMoney(amount, { type: LocationType.PlayerCoins, player: this.player })
  }

  /** Discovery and Fame tiles alike: 7 of them in front of a player ends the game (rulebook p.11). */
  countTiles(player: number): number {
    return countPlayerTiles(this, player)
  }

  /**
   * The Jungle cards a purchase reaches: the 3 of the market, or the 3 cards nobody has seen at the
   * bottom of the deck when the effect says so (rulebook p.5 and p.12).
   */
  jungleBuyCandidates(effect: EffectOf<EffectType.BuyJungle>): number[] {
    if (!effect.fromDeckBottom) return this.jungleMarket.getIndexes()
    return this.jungleDeck
      .sort((card) => card.location.x ?? 0)
      .limit(3)
      .getIndexes()
  }

  /**
   * Whether an effect can still give the player anything. Buying a Jungle card is the only gain
   * that can be out of reach before it is even started — the gold has to be there, and a card to
   * spend it on — and what cannot be applied is never offered: a card whose whole gain is a
   * purchase the player cannot pay for is not playable at all (rulebook p.6).
   *
   * A slash is worth whichever of its two gains is still worth something.
   */
  canApplyEffect(effect: Effect): boolean {
    switch (effect.type) {
      case EffectType.BuyJungle:
        return this.gold >= effect.cost && this.jungleBuyCandidates(effect).length > 0
      case EffectType.Choice:
        return effect.options.some((option) => this.canApplyEffect(option))
      default:
        return true
    }
  }

  // ------------------------------------------------------------------ the queue of effects

  get pendingEffects(): Effect[] {
    return this.remind<Effect[]>(Memory.PendingEffects) ?? []
  }

  /**
   * Effects fall in behind the ones already waiting: an action is resolved in full before the
   * bonuses it triggered on the way, and those in the order they were triggered.
   */
  pushEffects(effects: Effect[]): void {
    if (effects.length) this.memorize(Memory.PendingEffects, [...this.pendingEffects, ...effects])
  }

  /**
   * The gains of a bonus do not fall in behind it, they jump the queue: they *are* the bonus. A card
   * that gives up what it held hands it over there and then, before the cards beside it take their
   * turn.
   */
  private unshiftEffects(effects: Effect[]): void {
    if (effects.length) this.memorize(Memory.PendingEffects, [...effects, ...this.pendingEffects])
  }

  /** The effect being resolved, and how much of it the player was given to spend. */
  currentEffect<T extends Effect>(): T {
    return this.remind<T>(Memory.CurrentEffect)
  }

  get currentEffectCount(): number {
    return this.remind<{ count: number }>(Memory.CurrentEffect).count
  }

  /** What is left of the effect being resolved: moves to spend, pawns to place, cards to discard. */
  get remaining(): number {
    return this.remind<number>(Memory.Remaining)
  }

  /**
   * Spends one unit of the current effect and hands back to the queue once nothing is left.
   *
   * Nothing an effect gives is ever declined: the rulebook hands out gains, it never offers them.
   * What is left is only lost when there is no way at all to spend it — no free Animal space, no
   * card to walk onto — and that is what `canContinue` says.
   */
  spendOne(canContinue: boolean): AurealisMove[] {
    return this.spend(1, canContinue)
  }

  /** The same, for the one move that is worth several units at once: a whole group walking together. */
  spend(count: number, canContinue: boolean): AurealisMove[] {
    const remaining = canContinue ? this.remaining - count : 0
    this.memorize(Memory.Remaining, remaining)
    return remaining > 0 ? [] : [this.startRule(RuleId.ResolveEffects)]
  }

  /** Nothing left to resolve: the action is over and the turn moves on to step III. */
  endOfAction(): AurealisMove[] {
    return [this.startRule(RuleId.CheckFame)]
  }

  // ------------------------------------------------------------------ the bonuses of a Jungle card

  /**
   * The bonuses of a Jungle card belong to no step of the rules: they fall due the very moment a
   * pawn lands on the space that unlocks them, whichever rule put it there and whatever that rule
   * still has to do. So they are watched on every item move — and nothing more than watched: a bonus
   * that has fallen due takes its place in the queue, behind what the player is currently spending,
   * and is resolved whole when its turn comes (see {@link resolveJungleDue}).
   *
   * Queueing the whole of it, rather than moving the pawns at once and queueing only the gains, is
   * what keeps a card readable when a single effect fills several of them at a time: each card gives
   * up what it holds and is paid for it before the next one is touched, instead of the whole row
   * emptying first and the gains raining down afterwards.
   */
  afterItemMove(move: AurealisItemMove): AurealisMove[] {
    const location = destination(move)
    if (location?.parent === undefined) return []
    switch (location.type) {
      case LocationType.JungleAnimalSpace:
        this.checkAnimalBonus(location.parent)
        break
      case LocationType.JungleDigSiteBonus:
        // The pawn on the Bonus Fouilles is the bonus, there is nothing to check. Both bonuses of the
        // card can fall due on that very move, and they are then resolved in that order.
        this.queueBonus(location.parent, JungleDue.DigSite)
        this.checkExplorationBonus(location.parent)
        break
      case LocationType.JungleAnimalBonus:
        this.checkExplorationBonus(location.parent)
        break
    }
    return []
  }

  private queueBonus(card: number, bonus: JungleDue): void {
    this.pushEffects([jungleDue(card, bonus)])
  }

  /**
   * As many Animal pawns on the card as it has spaces: the Bonus Animal has fallen due. The pawns
   * stay where they are until its turn comes — the card is full, so nothing more can be put on it in
   * the meantime.
   */
  private checkAnimalBonus(card: number): void {
    const item = this.material(MaterialType.JungleCard).getItem<Jungle>(card)
    if (item.location.type !== LocationType.PlayerJungle || this.hasAnimalBonus(card)) return
    if (this.animalPawnsOn(card).length < getAnimalSpaces(item.id)) return
    this.queueBonus(card, JungleDue.Animal)
  }

  /** Both bonus spaces of the card taken: the Bonus Exploration has fallen due. */
  private checkExplorationBonus(card: number): void {
    const item = this.material(MaterialType.JungleCard).getItem<Jungle>(card)
    if (item.location.type !== LocationType.PlayerJungle || this.isCompleted(item)) return
    if (!this.hasDigSite(card) || !this.hasAnimalBonus(card)) return
    this.queueBonus(card, JungleDue.Exploration)
  }

  /**
   * A bonus whose turn has come: the pawns it moves on the card, and the gains printed beside it,
   * which jump to the head of the queue so that they are handed over before anything else happens.
   */
  resolveJungleDue(effect: EffectOf<EffectType.JungleDue>): AurealisMove[] {
    const { card, bonus } = effect
    const item = this.material(MaterialType.JungleCard).getItem<Jungle>(card)
    const bonuses = getJungleBonuses(item.id)
    switch (bonus) {
      case JungleDue.DigSite:
        this.unshiftEffects(bonuses.digSite)
        return this.sendTeamHome(card, item.location.player!)
      case JungleDue.Animal:
        if (this.hasAnimalBonus(card)) return []
        this.unshiftEffects(bonuses.animal)
        return this.takeAnimalBonus(card)
      case JungleDue.Exploration:
        if (this.isCompleted(item)) return []
        this.unshiftEffects(bonuses.exploration)
        return this.completeJungle(card)
    }
  }

  /**
   * The Bonus Fouilles: the Archaeologists standing on the slots of the card have done their job and
   * go back to the Camp de base. Those waiting in the middle of the card stay where they are
   * (rulebook p.7).
   */
  private sendTeamHome(card: number, player: number): AurealisMove[] {
    const archaeologists = this.archaeologistsOnSlots(card)
    // The whole team walks home as one: a single move, and a single animation for it.
    return archaeologists.length ? [archaeologists.moveItemsAtOnce({ type: LocationType.BaseCampArchaeologists, player })] : []
  }

  /**
   * The Bonus Animal: one pawn slides onto the bonus space, where it records that the bonus was
   * obtained, and the others go back to the supply (rulebook p.5).
   *
   * The one that slides is the last of the column, the closest to the bonus space it moves onto:
   * the pawn takes the short step the player's own hand would take, rather than crossing the whole
   * card from the top of a column that is emptying at the same moment.
   */
  private takeAnimalBonus(card: number): AurealisMove[] {
    const pawns = this.animalPawnsOn(card)
    const last = pawns.maxBy((pawn) => pawn.location.x ?? 0).getIndex()
    const extraPawns = this.material(MaterialType.AnimalPawn).index(pawns.getIndexes().filter((index) => index !== last))
    return [
      // The pawns going back to the supply leave as one, so the card empties in a single animation.
      ...(extraPawns.length ? [extraPawns.deleteItemsAtOnce()] : []),
      this.material(MaterialType.AnimalPawn).index(last).moveItem({ type: LocationType.JungleAnimalBonus, parent: card })
    ]
  }

  /**
   * The Bonus Exploration: the two bonus pawns go back to the supply and the card is turned onto its
   * completed face. The Archaeologists still standing on it stay on it — there is simply nothing left
   * for them to do there (rulebook p.5 and p.8).
   *
   * The card turns over in the same breath as it is emptied, before its gains are handed over. A card
   * stripped of its two bonus pawns but still face up would read as one with every space free again,
   * and an Archaeologist sent by that very Bonus Exploration would walk onto a slot about to be
   * turned face down.
   */
  private completeJungle(card: number): AurealisMove[] {
    const digSite = this.material(MaterialType.DigSitePawn).location(LocationType.JungleDigSiteBonus).parent(card)
    const animal = this.material(MaterialType.AnimalPawn).location(LocationType.JungleAnimalBonus).parent(card)
    return [
      ...digSite.deleteItems(),
      ...animal.deleteItems(),
      // The completed face has no slot: whoever is still standing on one gathers in the middle.
      ...this.archaeologistsOnSlots(card).moveItems({ type: LocationType.JungleExtraArchaeologists, parent: card }),
      this.material(MaterialType.JungleCard).index(card).rotateItem(true)
    ]
  }
}
