import { Adventurer, AdventurerBack, AdventurerId, adventurers, getAdventurerBack, getBackMainType } from '../material/Adventurer'
import { adventurerHand, getCardsInPlay } from '../material/CardsInPlay'
import { CardsInPlay } from '../material/Condition'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { AurealisRules } from '../AurealisRules'
import { AiContext, buildContext, cardValue, handOfCardsValue } from './Evaluation'

/**
 * Step IV, the draw: which of the 5 backs of the river to take onto the stand.
 *
 * The one decision of the game made on backs alone — "sélectionnez vos cartes d'un seul coup, sans
 * les remplacer ni regarder leurs effets" (rulebook p.11) — so it is the one decision no amount of
 * simulating the position can settle: the front of the card being picked is not knowable, not even
 * for the last of them. It is weighed instead, out of what a back does say.
 *
 * And a back says a great deal. It carries the main type of the card, which is what every condition
 * on every Adventurer card counts (rulebook p.4), so a card taken changes what the rest of the hand
 * can do: it adds one to the player's own count of that type and takes one off the river's. A hand
 * of Naturalists whose conditions ask for a second Explorer is a hand that a single Explorer turns
 * from unplayable into three cards worth playing.
 *
 * It also carries the secondary type on the corner flap, which narrows the card down to the 3 or 4
 * cards of the game that share that pair — few enough that averaging what they would be worth is
 * worth more than guessing at the type alone.
 */

/** The fronts a player may legitimately have read: their own stand, and the face-up discard. */
const visibleFronts = (rules: AurealisRules, player: number): Set<Adventurer> => {
  const seen = new Set<Adventurer>()
  for (const item of adventurerHand(rules, player).getItems<AdventurerId>()) {
    if (!item.location.rotation && item.id.front !== undefined) seen.add(item.id.front)
  }
  for (const item of rules.material(MaterialType.AdventurerCard).location(LocationType.AdventurerDiscard).getItems<AdventurerId>()) {
    if (item.id.front !== undefined) seen.add(item.id.front)
  }
  return seen
}

/** What a card showing that back is worth on average, over the cards of the game it could still be. */
const backValue = (back: AdventurerBack, cards: CardsInPlay, ctx: AiContext, seen: Set<Adventurer>, cache: Map<AdventurerBack, number>): number => {
  const cached = cache.get(back)
  if (cached !== undefined) return cached
  const candidates = adventurers.filter((card) => getAdventurerBack(card) === back && !seen.has(card))
  const value = candidates.length ? candidates.reduce((total, card) => total + cardValue(card, cards, ctx), 0) / candidates.length : 0
  cache.set(back, value)
  return value
}

/**
 * What the hand would be worth once that card of the river stands on it. Every card of the hand is
 * weighed again, since the card taken is what may have made them playable — and the cards drawn
 * earlier in the same turn, which lie face down, are weighed off their backs like the new one.
 */
export const draftValue = (rules: AurealisRules, player: number, card: number): number => {
  const ctx = buildContext(rules, player)
  const cards = getCardsInPlay(rules, player, ctx.opponent)
  const back = rules.material(MaterialType.AdventurerCard).getItem<AdventurerId>(card).id.back
  const drawn = getBackMainType(back)
  const after: CardsInPlay = {
    hand: { ...cards.hand, [drawn]: cards.hand[drawn] + 1 },
    opponent: cards.opponent,
    river: { ...cards.river, [drawn]: Math.max(0, cards.river[drawn] - 1) }
  }
  const seen = visibleFronts(rules, player)
  const cache = new Map<AdventurerBack, number>()
  const values = adventurerHand(rules, player)
    .getItems<AdventurerId>()
    .map((item) =>
      !item.location.rotation && item.id.front !== undefined
        ? cardValue(item.id.front, after, ctx)
        : backValue(item.id.back, after, ctx, seen, cache)
    )
  return handOfCardsValue([...values, backValue(back, after, ctx, seen, cache)])
}
