import {
  CustomMove,
  isCreateItem,
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
import { Effect, EffectOf, EffectType } from '../material/Effect'
import { getAnimalSpaces, getArchaeologistSpaces, getJungleBonuses, Jungle } from '../material/Jungle'
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
    return this.material(MaterialType.JungleCard).location(LocationType.PlayerJungle).player(player)
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
    return !!card.location.rotation
  }

  freeAnimalSpaces(card: number): number {
    const item = this.material(MaterialType.JungleCard).getItem<Jungle>(card)
    if (this.isCompleted(item)) return 0
    return getAnimalSpaces(item.id) - this.animalPawnsOn(card).length
  }

  /** The player's Jungle cards that can still take an Animal pawn. */
  get jungleCardsWithFreeAnimalSpace(): number[] {
    return this.jungleCards()
      .getIndexes()
      .filter((card) => this.freeAnimalSpaces(card) > 0)
  }

  animalPawnsOn(card: number): AurealisMaterial {
    return this.material(MaterialType.AnimalPawn).location(LocationType.JungleAnimalSpace).parent(card)
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
    const item = this.material(MaterialType.JungleCard).getItem<Jungle>(card)
    if (this.isCompleted(item) || this.hasDigSite(card)) return 0
    return getArchaeologistSpaces(item.id) - this.archaeologistsOnSlots(card).length
  }

  /** The Bonus Fouilles of the card taken: its Dig Site has been built, and never will be again. */
  hasDigSite(card: number): boolean {
    return this.material(MaterialType.DigSitePawn).location(LocationType.JungleDigSiteBonus).parent(card).length > 0
  }

  /** All the Archaeologist slots of the card taken: what the Dig Site action asks for (rulebook p.7). */
  isDigSiteReady(card: number): boolean {
    const item = this.material(MaterialType.JungleCard).getItem<Jungle>(card)
    if (this.isCompleted(item) || this.hasDigSite(card)) return false
    return this.archaeologistsOnSlots(card).length >= getArchaeologistSpaces(item.id)
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
   * still has to do. So they are watched on every item move, and what they give queues up behind
   * what the player is currently spending.
   */
  afterItemMove(move: AurealisItemMove): AurealisMove[] {
    const location = destination(move)
    if (location?.parent === undefined) return []
    switch (location.type) {
      case LocationType.JungleAnimalSpace:
        return this.checkAnimalBonus(location.parent)
      case LocationType.JungleDigSiteBonus:
        return [...this.onDigSiteBuilt(location.parent), ...this.checkExplorationBonus(location.parent)]
      case LocationType.JungleAnimalBonus:
        return this.checkExplorationBonus(location.parent)
      default:
        return []
    }
  }

  /**
   * A Dig Site has just been built on the card: the Archaeologists standing on its slots have done
   * their job and go back to the Camp de base, and the Bonus Fouilles is obtained. Those waiting in
   * the middle of the card stay where they are (rulebook p.7).
   */
  private onDigSiteBuilt(card: number): AurealisMove[] {
    const item = this.material(MaterialType.JungleCard).getItem<Jungle>(card)
    const player = item.location.player!
    this.pushEffects(getJungleBonuses(item.id).digSite)
    const archaeologists = this.archaeologistsOnSlots(card)
    // The whole team walks home as one: a single move, and a single animation for it.
    return archaeologists.length ? [archaeologists.moveItemsAtOnce({ type: LocationType.BaseCampArchaeologists, player })] : []
  }

  /**
   * As many Animal pawns on the card as it has spaces: the Bonus Animal is obtained, one pawn slides
   * onto its space to record it, and the others go back to the supply (rulebook p.5).
   */
  private checkAnimalBonus(card: number): AurealisMove[] {
    const item = this.material(MaterialType.JungleCard).getItem<Jungle>(card)
    if (item.location.type !== LocationType.PlayerJungle) return []
    const pawns = this.animalPawnsOn(card)
    if (pawns.length < getAnimalSpaces(item.id)) return []
    if (this.material(MaterialType.AnimalPawn).location(LocationType.JungleAnimalBonus).parent(card).length > 0) return []
    const indexes = pawns.getIndexes()
    this.pushEffects(getJungleBonuses(item.id).animal)
    return [
      ...this.material(MaterialType.AnimalPawn).index(indexes.slice(1)).deleteItems(),
      this.material(MaterialType.AnimalPawn).index(indexes[0]).moveItem({ type: LocationType.JungleAnimalBonus, parent: card })
    ]
  }

  /**
   * Both bonus spaces of the card taken: the Bonus Exploration is obtained, the two pawns go back to
   * the supply and the card is turned onto its completed face. The Archaeologists still standing on
   * it stay on it — there is simply nothing left for them to do there (rulebook p.5 and p.8).
   */
  private checkExplorationBonus(card: number): AurealisMove[] {
    const item = this.material(MaterialType.JungleCard).getItem<Jungle>(card)
    if (item.location.type !== LocationType.PlayerJungle || this.isCompleted(item)) return []
    const digSite = this.material(MaterialType.DigSitePawn).location(LocationType.JungleDigSiteBonus).parent(card)
    const animal = this.material(MaterialType.AnimalPawn).location(LocationType.JungleAnimalBonus).parent(card)
    if (!digSite.length || !animal.length) return []
    this.pushEffects(getJungleBonuses(item.id).exploration)
    return [
      ...digSite.deleteItems(),
      ...animal.deleteItems(),
      // The completed face has no slot: whoever is still standing on one gathers in the middle.
      ...this.archaeologistsOnSlots(card).moveItems({ type: LocationType.JungleExtraArchaeologists, parent: card }),
      this.material(MaterialType.JungleCard).index(card).rotateItem(true)
    ]
  }
}
