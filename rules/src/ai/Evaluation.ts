import { Adventurer, AdventurerId } from '../material/Adventurer'
import { getLineEffects, getPlayableLine } from '../material/AdventurerLines'
import { archaeologistsAtCamp, archaeologistsOn, extraArchaeologistsOn } from '../material/Archaeologists'
import { adventurerHand, getCardsInPlay } from '../material/CardsInPlay'
import { playerGold } from '../material/Coin'
import { CardsInPlay } from '../material/Condition'
import { Effect, EffectOf, EffectType } from '../material/Effect'
import { getAnimalSpaces, getArchaeologistSpaces, getJungleBonuses, getPlantIcons, Jungle } from '../material/Jungle'
import { freeArchaeologistSlots, givesTempleTile, hasAnimalBonus, hasDigSite, isCompletedJungle, playerJungleCards } from '../material/JungleState'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { countPlayerTiles } from '../material/PlayerTiles'
import { isTemple } from '../material/Temple'
import { Tile, TilePile } from '../material/Tile'
import { AurealisRules } from '../AurealisRules'
import { Memory } from '../Memory'
import { RuleId } from '../rules/RuleId'

/**
 * How good a position is for the player an automatic player is playing. One number, in which
 * everything is priced against the same unit: a Discovery or Fame tile, of which 7 win the game.
 *
 * The scale is set by the three things the strategy of the game turns on:
 *
 * - a Temple tile is worth far more than the tile it is, and the second one more than the first,
 *   because the third ends the game on the spot (rulebook p.11). The only place one ever comes from
 *   is the Bonus Exploration of 5 Jungle cards, so those cards carry that value long before they
 *   are completed, which is why they have to be taken the moment they show up;
 * - 7 gold is the price of a Jungle card at the Camp de base, so gold up to that mark buys the one
 *   thing gold can always buy, and gold beyond it buys nothing in particular;
 * - a bonus space half filled is worth much less than half its bonus: what pays is finishing a card,
 *   not spreading pawns over three of them. Hence the convex curve below.
 *
 * Nothing here reads what a player could not see at the table: a card front is only ever read on the
 * player's own stand, and only when the card is not one of those just drawn face down.
 */

/** A Discovery or Fame tile. 7 of them win the game: each is a seventh of it. */
const TILE = 12
/**
 * What holding 0, 1, 2 and 3 Temple tiles is worth on top of the tiles themselves. The steps grow
 * because the third one ends the game on the spot (rulebook p.11).
 */
const TEMPLE_TOTALS = [0, 50, 160, 660]
/**
 * How much of a Temple tile a Jungle card that gives one is already worth, untouched. A good part of
 * it: there are 5 such cards in the whole game, 3 of them win it, and a card left on the market is a
 * card the opponent takes, so owning it is what decides who can have the tile at all.
 *
 * Not more than a good part, though. Set to 0.6, the same player buys the same cards — both of them
 * take a Temple card 95 times out of 100 whenever one shows up — but pays more for them and reaches
 * fewer of them with its pawns: over 120 games played from both seats, 0.4 beat 0.6 by 73 to 47.
 */
const TEMPLE_CARD_HELD = 0.4
/** A Jungle card in itself: one card towards the Fame tile, and one more card the row can reach. */
const JUNGLE_CARD = 6
const PLANT_ICON = 3
/** An Archaeologist a send has nowhere better to put than where it already stands. */
const IDLE_PAWN = 0.3
/**
 * What one card of the row already walked is worth to an Archaeologist, wherever on that card it
 * stands. Every slot a pawn may still fill lies to its right: the row grows rightwards, a card whose
 * slots have been filled never frees one again, and a pawn only ever walks deeper into the jungle.
 * So the Camp de base — one card before the first Jungle one — is the worst place of the row for a
 * pawn to stand, not the best, and a move left over at the end of an action is worth spending to
 * walk the team one card further in.
 */
const PAWN_ADVANCE = 0.5
/** An Archaeologist move with nowhere worth going. */
const SPARE_MOVE = 0.15
/** "At least 7 gold at all times": the price of a Jungle card at the Camp de base. */
const GOLD_TARGET = 7
const GOLD_KEPT = 1.6
const GOLD_SPARE = 0.5
/**
 * What a pawn is worth when a gain is priced from inside another gain: the Bonus Fouilles of a card
 * hands out Archaeologists, and pricing those the careful way would ask what that very card is worth.
 * One step in, the flat rate is used instead, which is what breaks the circle.
 */
const FLAT_MOVE = 1.2
const FLAT_SEND = 2.5
const FLAT_ANIMAL = 2
/** Only one card is played per turn, so a hand is mostly worth its best card. */
const HAND_BEST = 0.5
const HAND_OTHER = 0.1
const WIN = 100000

/** A bonus space half filled is worth less than half its bonus: finishing a card is what pays. */
const curve = (fraction: number): number => Math.min(1, Math.max(0, fraction)) ** 1.5

/** What a gain not yet obtained is worth: never nothing, since a card is bought for its promise. */
const promise = (value: number, progress: number): number => value * (0.3 + 0.7 * curve(progress))

/**
 * What being on course for that many Temple tiles is worth — a fractional count, since a Temple card
 * half worked on is half a tile on the way. Read off {@link TEMPLE_TOTALS}, straight between two
 * whole numbers.
 *
 * Asking the question this way rather than pricing each Temple card on its own is what keeps the
 * pawns going to the same card until it is done: every card of the row is worth the same slope, and
 * inside one card the curve rises. Priced one by one, the biggest step would fall to whichever card
 * is furthest behind, and the pawns would follow it from card to card without ever finishing one.
 */
const templeValue = (expected: number): number => {
  const capped = Math.min(TEMPLE_TOTALS.length - 1, Math.max(0, expected))
  const step = Math.floor(capped)
  if (step >= TEMPLE_TOTALS.length - 1) return TEMPLE_TOTALS[TEMPLE_TOTALS.length - 1]
  return TEMPLE_TOTALS[step] + (TEMPLE_TOTALS[step + 1] - TEMPLE_TOTALS[step]) * (capped - step)
}

/** How much of its Temple tile one of the player's Temple cards is already worth. */
const templeCardShare = (jungle: JungleCardState): number =>
  TEMPLE_CARD_HELD +
  (1 - TEMPLE_CARD_HELD) *
    curve(
      (jungle.digSiteDone ? 1 : jungle.archaeologists / jungle.archaeologistSpaces) *
        (jungle.animalBonusDone ? 1 : jungle.animals / jungle.animalSpaces)
    )

/** One of the player's Jungle cards, read the way every decision about it has to read it. */
export type JungleCardState = {
  index: number
  id: Jungle
  /** Its place in the row, the Camp de base being the card before the first one. */
  x: number
  completed: boolean
  digSiteDone: boolean
  animalBonusDone: boolean
  archaeologists: number
  archaeologistSpaces: number
  animals: number
  animalSpaces: number
}

/** Everything an evaluation asks of the position, read once. */
export type AiContext = {
  rules: AurealisRules
  player: number
  opponent: number
  gold: number
  jungles: JungleCardState[]
  templeTiles: number
  relicsLeft: number
  legendaryAnimalsLeft: number[]
  /** Temple tiles held, plus the Jungle cards that will give one: how close the game is to won. */
  templeProspects: number
  /** The same, counted finely: a Temple card half worked on is half a tile on the way. */
  templeExpectation: number
  /** Gold is precious while a Jungle card is still missing, and small change once they are all in. */
  needsGold: boolean
  /** Where the pawns free to walk stand, the Camp de base being -1. */
  idlePawns: number[]
}

const jungleState = (rules: AurealisRules, index: number): JungleCardState => {
  const item = rules.material(MaterialType.JungleCard).getItem<Jungle>(index)
  return {
    index,
    id: item.id,
    x: item.location.x ?? 0,
    completed: isCompletedJungle(item),
    digSiteDone: hasDigSite(rules, index),
    animalBonusDone: hasAnimalBonus(rules, index),
    archaeologists: getArchaeologistSpaces(item.id) - freeArchaeologistSlots(rules, index),
    archaeologistSpaces: getArchaeologistSpaces(item.id),
    animals: rules.material(MaterialType.AnimalPawn).location(LocationType.JungleAnimalSpace).parent(index).length,
    animalSpaces: getAnimalSpaces(item.id)
  }
}

export const buildContext = (rules: AurealisRules, player: number): AiContext => {
  const jungles = playerJungleCards(rules, player)
    .getIndexes()
    .map((index) => jungleState(rules, index))
    .sort((a, b) => a.x - b.x)
  const templeTiles = rules.material(MaterialType.Tile).location(LocationType.PlayerTiles).player(player).id(isTemple).length
  const templeCards = jungles.filter((jungle) => givesTempleTile(jungle.id) && !jungle.completed)
  const templeProspects = templeTiles + templeCards.length
  return {
    rules,
    player,
    opponent: rules.players.find((other) => other !== player) ?? player,
    gold: playerGold(rules, player),
    jungles,
    templeTiles,
    relicsLeft: rules.material(MaterialType.Tile).location(LocationType.Reserve).locationId(TilePile.Relic).length,
    legendaryAnimalsLeft: rules
      .material(MaterialType.Tile)
      .location(LocationType.Reserve)
      .locationId(TilePile.LegendaryAnimal)
      .getItems<Tile>()
      .map((item) => item.id),
    templeProspects,
    templeExpectation: templeTiles + templeCards.reduce((total, jungle) => total + templeCardShare(jungle), 0),
    needsGold: templeProspects < 3,
    idlePawns: [
      ...archaeologistsAtCamp(rules, player)
        .getIndexes()
        .map(() => -1),
      ...jungles.flatMap((jungle) =>
        extraArchaeologistsOn(rules, jungle.index)
          .getIndexes()
          .map(() => jungle.x)
      )
    ]
  }
}

// ------------------------------------------------------------------ gold

const goldValue = (gold: number, needsGold: boolean): number => {
  if (!needsGold) return gold * GOLD_SPARE
  const kept = Math.min(gold, GOLD_TARGET)
  return kept * GOLD_KEPT + (gold - kept) * GOLD_SPARE
}

/** What gaining that much gold is worth from where we stand, or paying it when the amount is negative. */
const goldGain = (ctx: AiContext, amount: number): number =>
  goldValue(Math.max(0, ctx.gold + amount), ctx.needsGold) - goldValue(ctx.gold, ctx.needsGold)

// ------------------------------------------------------------------ the bonuses of a Jungle card

/**
 * A list of gains printed on a card or a tile. The Temple tile is priced apart when asked.
 *
 * Always one step in, never at the top: a bonus is something a card promises, and pricing it the
 * careful way would send the count back through the very card it is printed on.
 */
const bonusValue = (effects: Effect[], ctx: AiContext, skipTemple = false): number =>
  effects.reduce((total, effect) => total + (skipTemple && effect.type === EffectType.TempleTile ? 0 : effectValue(effect, ctx, 1)), 0)

/** What the Bonus Exploration of a card is worth, once both its bonus spaces have been taken. */
const explorationValue = (jungle: JungleCardState, ctx: AiContext, skipTemple = false): number =>
  jungle.completed ? 0 : bonusValue(getJungleBonuses(jungle.id).exploration, ctx, skipTemple)

/** What one more Archaeologist on a printed slot of that card brings: the Dig Site drawing nearer. */
const slotMarginal = (jungle: JungleCardState, filled: number, ctx: AiContext): number => {
  if (jungle.completed || jungle.digSiteDone || filled >= jungle.archaeologistSpaces) return 0
  const animals = jungle.animalBonusDone ? 1 : jungle.animals / jungle.animalSpaces
  const reward =
    bonusValue(getJungleBonuses(jungle.id).digSite, ctx) + explorationValue(jungle, ctx) * curve(animals)
  return reward * (curve((filled + 1) / jungle.archaeologistSpaces) - curve(filled / jungle.archaeologistSpaces))
}

/** Likewise for one more Animal pawn. */
const animalMarginal = (jungle: JungleCardState, placed: number, ctx: AiContext): number => {
  if (jungle.completed || jungle.animalBonusDone || placed >= jungle.animalSpaces) return 0
  const diggers = jungle.digSiteDone ? 1 : jungle.archaeologists / jungle.archaeologistSpaces
  const reward = bonusValue(getJungleBonuses(jungle.id).animal, ctx) + explorationValue(jungle, ctx) * curve(diggers)
  return reward * (curve((placed + 1) / jungle.animalSpaces) - curve(placed / jungle.animalSpaces))
}

/** How many Archaeologist moves it takes to walk a free pawn onto that card. */
const stepsTo = (ctx: AiContext, jungle: JungleCardState): number =>
  ctx.idlePawns.reduce((best, pawn) => Math.min(best, Math.max(1, Math.abs(jungle.x - pawn))), Infinity)

/** The pawns placed one after the other, each of them where it brings the most. */
const greedyFill = (ctx: AiContext, count: number, marginal: (jungle: JungleCardState, filled: number) => number, filled: number[]): number => {
  let total = 0
  for (let pawn = 0; pawn < count; pawn++) {
    let bestIndex = -1
    let best = 0
    ctx.jungles.forEach((jungle, index) => {
      const gain = marginal(jungle, filled[index])
      if (gain > best) {
        best = gain
        bestIndex = index
      }
    })
    if (bestIndex < 0) break
    total += best
    filled[bestIndex]++
  }
  return total
}

const animalsValue = (ctx: AiContext, count: number): number =>
  count <= 0
    ? 0
    : greedyFill(
        ctx,
        count,
        (jungle, placed) => animalMarginal(jungle, placed, ctx),
        ctx.jungles.map((jungle) => jungle.animals)
      )

/** One Animal pawn on each Jungle card at once: the cards are all served, none is chosen. */
const animalOnEachValue = (ctx: AiContext): number =>
  ctx.jungles.reduce((total, jungle) => total + animalMarginal(jungle, jungle.animals, ctx), 0)

/**
 * Archaeologists sent anywhere: distance costs nothing, so the best slots are simply taken. Past the
 * pawns that are free to leave, a pawn has to be pulled off a slot it was filling, which is mostly
 * undoing work.
 */
const sendValue = (ctx: AiContext, count: number): number => {
  const free = Math.min(count, ctx.idlePawns.length)
  const filled = ctx.jungles.map((jungle) => jungle.archaeologists)
  return greedyFill(ctx, free, (jungle, taken) => slotMarginal(jungle, taken, ctx), filled) + (count - free) * IDLE_PAWN
}

/**
 * Archaeologist moves, spent one card at a time: a slot is worth what it brings divided by the walk
 * it takes to reach it, and what cannot be walked anywhere is nearly lost.
 */
const movesValue = (ctx: AiContext, count: number): number => {
  if (count <= 0) return 0
  const filled = ctx.jungles.map((jungle) => jungle.archaeologists)
  let left = count
  let total = 0
  for (;;) {
    let bestIndex = -1
    let bestRatio = 0
    let bestGain = 0
    let bestCost = 0
    ctx.jungles.forEach((jungle, index) => {
      const gain = slotMarginal(jungle, filled[index], ctx)
      const cost = stepsTo(ctx, jungle)
      if (gain <= 0 || cost > left) return
      if (gain / cost > bestRatio) {
        bestRatio = gain / cost
        bestIndex = index
        bestGain = gain
        bestCost = cost
      }
    })
    if (bestIndex < 0) break
    total += bestGain
    left -= bestCost
    filled[bestIndex]++
  }
  return total + left * SPARE_MOVE
}

// ------------------------------------------------------------------ Jungle cards

/**
 * A Jungle card in a player's row. Its Bonus Exploration counts here for everything but a Temple
 * tile, which is priced once for all the cards in {@link templeProspectsValue}: what a Temple tile
 * is worth depends on how many the player already holds, so no card can price its own.
 */
const jungleCardValue = (jungle: JungleCardState, ctx: AiContext): number => {
  const value = JUNGLE_CARD + getPlantIcons(jungle.id) * PLANT_ICON
  if (jungle.completed) return value
  const bonuses = getJungleBonuses(jungle.id)
  const diggers = jungle.digSiteDone ? 1 : jungle.archaeologists / jungle.archaeologistSpaces
  const animals = jungle.animalBonusDone ? 1 : jungle.animals / jungle.animalSpaces
  const digSite = jungle.digSiteDone ? 0 : promise(bonusValue(bonuses.digSite, ctx), diggers)
  const animal = jungle.animalBonusDone ? 0 : promise(bonusValue(bonuses.animal, ctx), animals)
  return value + digSite + animal + promise(bonusValue(bonuses.exploration, ctx, true), diggers * animals)
}

/** A Jungle card the player does not own yet, and what taking it would add to their row. */
export const newJungleValue = (jungle: Jungle, ctx: AiContext): number => {
  const fresh: JungleCardState = {
    index: -1,
    id: jungle,
    x: ctx.jungles.length,
    completed: false,
    digSiteDone: false,
    animalBonusDone: false,
    archaeologists: 0,
    archaeologistSpaces: getArchaeologistSpaces(jungle),
    animals: 0,
    animalSpaces: getAnimalSpaces(jungle)
  }
  return jungleCardValue(fresh, ctx) + (givesTempleTile(jungle) ? templeCardGain(ctx) : 0)
}

/** What one more Temple card in the row is worth, untouched: the step it takes towards the third. */
const templeCardGain = (ctx: AiContext): number => templeValue(ctx.templeExpectation + TEMPLE_CARD_HELD) - templeValue(ctx.templeExpectation)

/**
 * How close the player is to the third Temple tile, which ends the game. A tile already won counts
 * in full; a Jungle card that will give one counts for what it promises, which is a great deal even
 * untouched: there are only 5 such cards in the game, and the opponent wants them too.
 */
const templeProspectsValue = (ctx: AiContext): number => templeValue(ctx.templeExpectation)

/** What the next Temple tile is worth: the tile itself, and the step it takes towards the third. */
const templeTileGain = (ctx: AiContext): number => TILE + templeValue(ctx.templeTiles + 1) - templeValue(ctx.templeTiles)

// ------------------------------------------------------------------ buying a Jungle card

/** The 3 cards of the market: the 2 laid beside the deck, and the face-up top of the deck. */
const marketJungles = (rules: AurealisRules): Jungle[] => {
  const beside = rules.material(MaterialType.JungleCard).location(LocationType.JungleMarket).getItems<Jungle>()
  const top = rules
    .material(MaterialType.JungleCard)
    .location(LocationType.JungleDeck)
    .maxBy((item) => item.location.x ?? 0)
    .getItems<Jungle>()
  return [...beside, ...top].map((item) => item.id)
}

/**
 * The 3 cards at the bottom of the Jungle deck are nobody's to see until the Temple tile is taken,
 * so they are weighed rather than read: what is worth knowing is how many of the 5 Temple cards are
 * still unaccounted for, which is public. The order of the deck is not.
 */
const deckBottomValue = (ctx: AiContext): number => {
  const rules = ctx.rules
  const deck = rules.material(MaterialType.JungleCard).location(LocationType.JungleDeck).length
  if (!deck) return 0
  const shown = [
    ...rules.material(MaterialType.JungleCard).location(LocationType.PlayerJungle).getItems<Jungle>(),
    ...rules.material(MaterialType.JungleCard).location(LocationType.JungleMarket).getItems<Jungle>()
  ].filter((item) => givesTempleTile(item.id)).length
  const hidden = Math.max(1, deck - 1)
  const chance = Math.min(1, ((5 - shown) * Math.min(3, hidden)) / hidden)
  return chance * templeCardGain(ctx) + JUNGLE_CARD
}

const buyJungleValue = (ctx: AiContext, effect: EffectOf<EffectType.BuyJungle>): number => {
  if (ctx.gold < effect.cost) return 0
  const cards = effect.fromDeckBottom ? [deckBottomValue(ctx)] : marketJungles(ctx.rules).map((jungle) => newJungleValue(jungle, ctx))
  if (!cards.length) return 0
  return Math.max(...cards) + goldGain(ctx, -effect.cost)
}

// ------------------------------------------------------------------ effects

/**
 * What a gain of the game is worth here and now, whichever card, tile or Camp de base offers it.
 *
 * `depth` is 0 for a gain the player is about to receive, and 1 for one printed inside something
 * being priced — the Bonus Fouilles of a Jungle card being weighed up, say. At depth 0 the pawns are
 * walked and placed one by one, each of them where it brings the most; one step in, the flat rates
 * stand in for that, because working it out properly would ask the value of the card the bonus is
 * printed on, which is the question being answered.
 */
export const effectValue = (effect: Effect, ctx: AiContext, depth = 0): number => {
  const flat = depth > 0
  switch (effect.type) {
    case EffectType.Gold:
      return goldGain(ctx, effect.gold)
    case EffectType.ArchaeologistMoves:
      return flat ? effect.count * FLAT_MOVE : movesValue(ctx, effect.count)
    case EffectType.MovesOrGold:
      return Math.max(flat ? effect.count * FLAT_MOVE : movesValue(ctx, effect.count), goldGain(ctx, effect.count))
    case EffectType.SendArchaeologists:
      return flat ? effect.count * FLAT_SEND : sendValue(ctx, effect.count)
    case EffectType.PlaceAnimals:
      return flat ? Math.min(effect.count, freeAnimalSpaces(ctx)) * FLAT_ANIMAL : animalsValue(ctx, effect.count)
    case EffectType.AnimalOnEachJungle:
      return flat ? cardsWithFreeAnimalSpace(ctx) * FLAT_ANIMAL : animalOnEachValue(ctx)
    case EffectType.BuyJungle:
      return buyJungleValue(ctx, effect)
    case EffectType.RelicTile:
      return ctx.relicsLeft > 0 ? TILE : 0
    case EffectType.LegendaryAnimalTile:
      return ctx.legendaryAnimalsLeft.includes(effect.animal) ? TILE : 0
    case EffectType.TempleTile:
      return templeTileGain(ctx)
    case EffectType.Choice:
      return Math.max(...effect.options.map((option) => effectValue(option, ctx, depth)))
  }
}

const freeAnimalSpaces = (ctx: AiContext): number =>
  ctx.jungles.reduce((total, jungle) => total + (jungle.completed || jungle.animalBonusDone ? 0 : jungle.animalSpaces - jungle.animals), 0)

const cardsWithFreeAnimalSpace = (ctx: AiContext): number =>
  ctx.jungles.filter((jungle) => !jungle.completed && !jungle.animalBonusDone && jungle.animals < jungle.animalSpaces).length

/** What the line an Adventurer card would play is worth. A card no condition allows is worth 0. */
export const cardValue = (card: Adventurer, cards: CardsInPlay, ctx: AiContext): number => {
  const line = getPlayableLine(card, cards)
  if (!line) return 0
  return getLineEffects(line, cards).reduce((total, effect) => total + effectValue(effect, ctx), 0)
}

/** A hand is worth its best card above all: only one of them is played per turn. */
export const handOfCardsValue = (values: number[]): number => {
  if (!values.length) return 0
  const best = Math.max(...values)
  return HAND_BEST * best + HAND_OTHER * (values.reduce((total, value) => total + value, 0) - best)
}

const handValue = (ctx: AiContext): number => {
  const cards = getCardsInPlay(ctx.rules, ctx.player, ctx.opponent)
  const values = adventurerHand(ctx.rules, ctx.player)
    .getItems<AdventurerId>()
    // A card just drawn lies face down on the stand: its owner may not read it yet.
    .filter((item) => !item.location.rotation && item.id.front !== undefined)
    .map((item) => cardValue(item.id.front!, cards, ctx))
  return handOfCardsValue(values)
}

// ------------------------------------------------------------------ what the action still owes

/**
 * The queue of gains the action has not handed over yet, and what is left of the one being spent.
 * Without it, playing a card would look like nothing but a card leaving the hand.
 */
const pendingValue = (ctx: AiContext): number => {
  const pending = ctx.rules.remind<Effect[]>(Memory.PendingEffects) ?? []
  return pending.reduce((total, effect) => total + effectValue(effect, ctx), 0) + currentEffectValue(ctx)
}

const currentEffectValue = (ctx: AiContext): number => {
  const rule = ctx.rules.game.rule
  if (!rule || rule.player !== ctx.player) return 0
  const effect = ctx.rules.remind<Effect | undefined>(Memory.CurrentEffect)
  if (!effect) return 0
  const remaining = ctx.rules.remind<number>(Memory.Remaining) ?? 0
  switch (rule.id) {
    case RuleId.MoveArchaeologists:
      return effect.type === EffectType.MovesOrGold ? Math.max(movesValue(ctx, remaining), goldGain(ctx, remaining)) : movesValue(ctx, remaining)
    case RuleId.SendArchaeologists:
      return sendValue(ctx, remaining)
    case RuleId.PlaceAnimals:
      return animalsValue(ctx, remaining)
    case RuleId.AcquireJungle:
    case RuleId.ChooseTempleTile:
    case RuleId.ResolveEffects:
      return effectValue(effect, ctx)
    default:
      return 0
  }
}

// ------------------------------------------------------------------ the position

/**
 * Where the player's Archaeologists stand, and nothing else about them: a pawn on a printed slot is
 * priced by the Dig Site it is building, one in the middle of a card or at the Camp de base has
 * nothing under it at all, and both are the same piece.
 *
 * This is a potential and not a gain — it prices a position, never a step — which is what keeps it
 * from taking sides. Walking a pawn in earns exactly what building the Dig Site and sending the team
 * home gives back, so the whole cycle of the game is worth its bonuses and not a point more; all the
 * number does in between is lean the pawns the one way they can ever be of use, which is forwards.
 */
const pawnsValue = (ctx: AiContext): number =>
  ctx.jungles.reduce((total, jungle) => total + archaeologistsOn(ctx.rules, jungle.index).length * PAWN_ADVANCE * (jungle.x + 1), 0)

/**
 * The whole position in one number. Only the player's own side is priced: in a two-player game the
 * opponent's side never changes on the player's own turn, save for a Fame tile changing hands, and
 * that one already shows up as a tile gained.
 */
export const evaluate = (rules: AurealisRules, player: number): number => {
  const winner = rules.remind<number | undefined>(Memory.Winner)
  if (winner !== undefined) return winner === player ? WIN : -WIN
  const ctx = buildContext(rules, player)
  return (
    countPlayerTiles(rules, player) * TILE +
    templeProspectsValue(ctx) +
    ctx.jungles.reduce((total, jungle) => total + jungleCardValue(jungle, ctx), 0) +
    goldValue(ctx.gold, ctx.needsGold) +
    pawnsValue(ctx) +
    handValue(ctx) +
    pendingValue(ctx)
  )
}
