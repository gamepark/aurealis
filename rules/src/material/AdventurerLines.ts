import { Adventurer } from './Adventurer'
import { AdventurerType } from './AdventurerType'
import {
  allTypesInHand,
  CardsInPlay,
  cardsInPlay,
  Condition,
  countInPlay,
  Elsewhere,
  fewerThan,
  meetsCondition,
  minElsewhere,
  minInHand,
  minInPlay,
  moreThan,
  noneInHand
} from './Condition'
import { buyJungle, choice, Effect, gold, moves, movesOrGold, placeAnimals } from './Effect'

/**
 * One Condition-Effect line of an Adventurer card. A card carries 1, 2 or 3 of them, and a line can
 * hold two gains at once when the main and the secondary type of the card differ: the Archaeologist
 * with an Expedition Leader as secondary type both moves pawns and takes gold (rulebook p.4).
 *
 * Two gains sitting side by side are both applied. A slash between them means one *or* the other,
 * and that is a {@link EffectType.Choice} rather than two effects.
 *
 * A few cards scale with the game: their condition is "pour ? cartes X en jeu" and their gain is
 * worth that very number. Their effects are given as a function of the cards in play, read at the
 * moment the card is played — the same moment, and the same count, as its condition.
 */
export type ConditionEffectLine = {
  condition: Condition
  effects: Effect[] | ((cards: CardsInPlay) => Effect[])
}

const { Naturalist, Archaeologist, Explorer, ExpeditionLeader } = AdventurerType
const { OpponentOrRiver, OpponentAndRiver } = Elsewhere

/**
 * The lines printed on each of the 52 Adventurer cards, in the order they appear on the card —
 * which is from the easiest condition to the hardest, the gain growing along with it. That order is
 * what {@link getPlayableLine} relies on to apply "the most powerful effect" among the lines whose
 * conditions are met (rulebook p.6).
 *
 * Transcribed from the card artwork. Each card offers gains of its main type and of its secondary
 * type, and nothing else: the Naturalists place Animal pawns, the Archaeologists move theirs, the
 * Explorers buy Jungle cards and the Expedition Leaders bring in gold (rulebook p.4).
 */
export const adventurerLines: Record<Adventurer, ConditionEffectLine[]> = {
  [Adventurer.Naturalist1]: [{ condition: minInHand(Explorer, 2), effects: [placeAnimals(3)] }],
  [Adventurer.Naturalist2]: [
    { condition: moreThan(Naturalist, OpponentOrRiver), effects: [placeAnimals(2)] },
    { condition: moreThan(Naturalist, OpponentAndRiver), effects: [placeAnimals(3)] }
  ],
  [Adventurer.Naturalist3]: [
    { condition: minInHand(Naturalist, 2), effects: [placeAnimals(2)] },
    { condition: minInHand(Naturalist, 3), effects: [placeAnimals(3)] }
  ],
  [Adventurer.Naturalist4]: [{ condition: allTypesInHand, effects: [placeAnimals(1), buyJungle(5)] }],
  [Adventurer.Naturalist5]: [
    { condition: minInPlay(Naturalist, 2), effects: [placeAnimals(1)] },
    { condition: minInPlay(Naturalist, 4), effects: [placeAnimals(2)] },
    { condition: minInPlay(Naturalist, 6), effects: [placeAnimals(3)] }
  ],
  [Adventurer.Naturalist6]: [
    { condition: minElsewhere(Naturalist, OpponentOrRiver), effects: [placeAnimals(1)] },
    { condition: minElsewhere(Naturalist, OpponentAndRiver), effects: [choice(placeAnimals(2), buyJungle(4))] }
  ],
  [Adventurer.Naturalist7]: [{ condition: noneInHand(ExpeditionLeader), effects: [choice(placeAnimals(2), gold(5))] }],
  [Adventurer.Naturalist8]: [
    { condition: minElsewhere(Naturalist, OpponentOrRiver), effects: [placeAnimals(1)] },
    { condition: minElsewhere(Naturalist, OpponentAndRiver), effects: [choice(placeAnimals(2), gold(5))] }
  ],
  [Adventurer.Naturalist9]: [
    { condition: moreThan(Naturalist, OpponentOrRiver), effects: [placeAnimals(1), moves(2)] },
    { condition: moreThan(Naturalist, OpponentAndRiver), effects: [placeAnimals(2), moves(3)] }
  ],
  [Adventurer.Naturalist10]: [
    { condition: minInHand(Naturalist, 2), effects: [placeAnimals(2)] },
    { condition: minInHand(Naturalist, 3), effects: [placeAnimals(2), gold(3)] }
  ],
  [Adventurer.Naturalist11]: [
    { condition: fewerThan(Archaeologist, OpponentOrRiver), effects: [placeAnimals(2)] },
    { condition: fewerThan(Archaeologist, OpponentAndRiver), effects: [placeAnimals(2), moves(3)] }
  ],
  [Adventurer.Naturalist12]: [
    { condition: minInPlay(Naturalist, 2), effects: [placeAnimals(1)] },
    { condition: minInPlay(Naturalist, 4), effects: [placeAnimals(1), moves(2)] },
    { condition: minInPlay(Naturalist, 6), effects: [placeAnimals(2), moves(3)] }
  ],
  [Adventurer.Naturalist13]: [
    { condition: moreThan(Naturalist, OpponentOrRiver), effects: [choice(placeAnimals(2), buyJungle(5))] },
    { condition: moreThan(Naturalist, OpponentAndRiver), effects: [choice(placeAnimals(3), buyJungle(3))] }
  ],

  [Adventurer.Archaeologist1]: [{ condition: noneInHand(Explorer), effects: [choice(moves(5), buyJungle(4))] }],
  [Adventurer.Archaeologist2]: [{ condition: allTypesInHand, effects: [moves(4), placeAnimals(1)] }],
  [Adventurer.Archaeologist3]: [
    { condition: minElsewhere(Archaeologist, OpponentOrRiver), effects: [moves(3)] },
    { condition: minElsewhere(Archaeologist, OpponentAndRiver), effects: [moves(3), placeAnimals(1)] }
  ],
  [Adventurer.Archaeologist4]: [
    { condition: moreThan(Archaeologist, OpponentOrRiver), effects: [moves(2), placeAnimals(1)] },
    { condition: moreThan(Archaeologist, OpponentAndRiver), effects: [moves(5), placeAnimals(1)] }
  ],
  [Adventurer.Archaeologist5]: [
    { condition: cardsInPlay(Archaeologist), effects: (cards) => [movesOrGold(countInPlay(cards, Archaeologist))] }
  ],
  [Adventurer.Archaeologist6]: [
    { condition: moreThan(Archaeologist, OpponentOrRiver), effects: [movesOrGold(4)] },
    { condition: moreThan(Archaeologist, OpponentAndRiver), effects: [movesOrGold(6)] }
  ],
  [Adventurer.Archaeologist7]: [
    { condition: fewerThan(ExpeditionLeader, OpponentOrRiver), effects: [moves(4)] },
    { condition: fewerThan(ExpeditionLeader, OpponentAndRiver), effects: [moves(4), gold(3)] }
  ],
  [Adventurer.Archaeologist8]: [
    { condition: moreThan(Archaeologist, OpponentOrRiver), effects: [moves(4)] },
    { condition: moreThan(Archaeologist, OpponentAndRiver), effects: [moves(7)] }
  ],
  [Adventurer.Archaeologist9]: [{ condition: minInHand(Naturalist, 2), effects: [moves(6)] }],
  [Adventurer.Archaeologist10]: [
    { condition: minInHand(Archaeologist, 2), effects: [moves(4)] },
    { condition: minInHand(Archaeologist, 3), effects: [moves(7)] }
  ],
  [Adventurer.Archaeologist11]: [
    { condition: minElsewhere(Archaeologist, OpponentOrRiver), effects: [moves(3)] },
    { condition: minElsewhere(Archaeologist, OpponentAndRiver), effects: [choice(moves(5), buyJungle(4))] }
  ],
  [Adventurer.Archaeologist12]: [
    { condition: cardsInPlay(Archaeologist), effects: (cards) => [moves(countInPlay(cards, Archaeologist) + 1)] }
  ],
  [Adventurer.Archaeologist13]: [
    { condition: minInHand(Archaeologist, 2), effects: [moves(4)] },
    { condition: minInHand(Archaeologist, 3), effects: [choice(moves(6), buyJungle(3))] }
  ],

  [Adventurer.Explorer1]: [
    { condition: moreThan(Explorer, OpponentOrRiver), effects: [buyJungle(5)] },
    { condition: moreThan(Explorer, OpponentAndRiver), effects: [buyJungle(2)] }
  ],
  [Adventurer.Explorer2]: [{ condition: minInHand(ExpeditionLeader, 2), effects: [buyJungle(3)] }],
  [Adventurer.Explorer3]: [
    { condition: minElsewhere(Explorer, OpponentOrRiver), effects: [buyJungle(6)] },
    { condition: minElsewhere(Explorer, OpponentAndRiver), effects: [choice(buyJungle(4), placeAnimals(2))] }
  ],
  [Adventurer.Explorer4]: [{ condition: noneInHand(Archaeologist), effects: [choice(buyJungle(4), moves(5))] }],
  [Adventurer.Explorer5]: [{ condition: allTypesInHand, effects: [choice(buyJungle(4), gold(5))] }],
  [Adventurer.Explorer6]: [
    { condition: minElsewhere(Explorer, OpponentOrRiver), effects: [buyJungle(6)] },
    { condition: minElsewhere(Explorer, OpponentAndRiver), effects: [choice(buyJungle(4), gold(5))] }
  ],
  [Adventurer.Explorer7]: [
    { condition: moreThan(Explorer, OpponentOrRiver), effects: [buyJungle(5)] },
    { condition: moreThan(Explorer, OpponentAndRiver), effects: [choice(buyJungle(3), placeAnimals(3))] }
  ],
  [Adventurer.Explorer8]: [
    { condition: minInHand(Explorer, 2), effects: [buyJungle(5)] },
    { condition: minInHand(Explorer, 3), effects: [buyJungle(2)] }
  ],
  [Adventurer.Explorer9]: [
    { condition: fewerThan(Naturalist, OpponentOrRiver), effects: [buyJungle(5)] },
    { condition: fewerThan(Naturalist, OpponentAndRiver), effects: [buyJungle(4), placeAnimals(1)] }
  ],
  [Adventurer.Explorer10]: [
    {
      condition: cardsInPlay(Explorer),
      effects: (cards) => [choice(buyJungle(9 - countInPlay(cards, Explorer)), moves(countInPlay(cards, Explorer)))]
    }
  ],
  [Adventurer.Explorer11]: [
    { condition: minInHand(Explorer, 2), effects: [buyJungle(5)] },
    { condition: minInHand(Explorer, 3), effects: [choice(buyJungle(3), moves(6))] }
  ],
  [Adventurer.Explorer12]: [
    { condition: moreThan(Explorer, OpponentOrRiver), effects: [buyJungle(5)] },
    { condition: moreThan(Explorer, OpponentAndRiver), effects: [choice(buyJungle(3), gold(6))] }
  ],
  [Adventurer.Explorer13]: [{ condition: cardsInPlay(Explorer), effects: (cards) => [buyJungle(8 - countInPlay(cards, Explorer))] }],

  [Adventurer.ExpeditionLeader1]: [
    { condition: minElsewhere(ExpeditionLeader, OpponentOrRiver), effects: [gold(3)] },
    { condition: minElsewhere(ExpeditionLeader, OpponentAndRiver), effects: [gold(3), placeAnimals(1)] }
  ],
  [Adventurer.ExpeditionLeader2]: [
    { condition: moreThan(ExpeditionLeader, OpponentOrRiver), effects: [movesOrGold(4)] },
    { condition: moreThan(ExpeditionLeader, OpponentAndRiver), effects: [movesOrGold(6)] }
  ],
  [Adventurer.ExpeditionLeader3]: [
    { condition: cardsInPlay(ExpeditionLeader), effects: (cards) => [movesOrGold(countInPlay(cards, ExpeditionLeader))] }
  ],
  [Adventurer.ExpeditionLeader4]: [{ condition: allTypesInHand, effects: [movesOrGold(5)] }],
  [Adventurer.ExpeditionLeader5]: [
    { condition: cardsInPlay(ExpeditionLeader), effects: (cards) => [gold(countInPlay(cards, ExpeditionLeader) + 1)] }
  ],
  [Adventurer.ExpeditionLeader6]: [{ condition: minInHand(Archaeologist, 2), effects: [gold(6)] }],
  [Adventurer.ExpeditionLeader7]: [
    { condition: moreThan(ExpeditionLeader, OpponentOrRiver), effects: [gold(4)] },
    { condition: moreThan(ExpeditionLeader, OpponentAndRiver), effects: [gold(7)] }
  ],
  [Adventurer.ExpeditionLeader8]: [
    { condition: minInHand(ExpeditionLeader, 2), effects: [gold(4)] },
    { condition: minInHand(ExpeditionLeader, 3), effects: [gold(7)] }
  ],
  [Adventurer.ExpeditionLeader9]: [
    { condition: minInHand(ExpeditionLeader, 2), effects: [gold(2), placeAnimals(1)] },
    { condition: minInHand(ExpeditionLeader, 3), effects: [gold(5), placeAnimals(1)] }
  ],
  [Adventurer.ExpeditionLeader10]: [{ condition: noneInHand(Naturalist), effects: [gold(3), placeAnimals(1)] }],
  [Adventurer.ExpeditionLeader11]: [
    { condition: minElsewhere(ExpeditionLeader, OpponentOrRiver), effects: [gold(3)] },
    { condition: minElsewhere(ExpeditionLeader, OpponentAndRiver), effects: [choice(gold(5), buyJungle(4))] }
  ],
  [Adventurer.ExpeditionLeader12]: [
    { condition: moreThan(ExpeditionLeader, OpponentOrRiver), effects: [choice(gold(4), buyJungle(5))] },
    { condition: moreThan(ExpeditionLeader, OpponentAndRiver), effects: [choice(gold(6), buyJungle(3))] }
  ],
  [Adventurer.ExpeditionLeader13]: [
    { condition: fewerThan(Explorer, OpponentOrRiver), effects: [gold(4)] },
    { condition: fewerThan(Explorer, OpponentAndRiver), effects: [choice(gold(6), buyJungle(3))] }
  ]
}

/**
 * The line a card would apply, or undefined when none of its conditions is met — in which case the
 * card cannot be played at all (rulebook p.6).
 *
 * When several lines are met only the most powerful applies, and the most powerful is the last one:
 * the lines of a card go down from the easiest condition to the hardest.
 *
 * The conditions are read on the whole hand *before* the played card leaves it, so a card always
 * counts for its own condition.
 */
export const getPlayableLine = (card: Adventurer, cards: CardsInPlay): ConditionEffectLine | undefined =>
  adventurerLines[card].filter((line) => meetsCondition(line.condition, cards)).pop()

/** What the line gives, once the cards in play have settled the "?" of those that scale. */
export const getLineEffects = (line: ConditionEffectLine, cards: CardsInPlay): Effect[] =>
  typeof line.effects === 'function' ? line.effects(cards) : line.effects
