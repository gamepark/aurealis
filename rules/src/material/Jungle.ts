import { getEnumValues } from '@gamepark/rules-api'
import { animalOnEachJungle, Effect, gold, legendaryAnimalTile, relicTile, sendArchaeologists, templeTile } from './Effect'
import { LegendaryAnimal } from './LegendaryAnimal'

/**
 * The 20 Jungle cards. A simple id is enough: both faces of a card belong to that card, so knowing
 * either one identifies it. The verso is not a hidden back but the *completed face*, turned over
 * once the Dig Site and Animal bonuses have both been taken (rulebook p.5).
 */
export enum Jungle {
  Jungle1 = 1,
  Jungle2,
  Jungle3,
  Jungle4,
  Jungle5,
  Jungle6,
  Jungle7,
  Jungle8,
  Jungle9,
  Jungle10,
  Jungle11,
  Jungle12,
  Jungle13,
  Jungle14,
  Jungle15,
  Jungle16,
  Jungle17,
  Jungle18,
  Jungle19,
  Jungle20
}

export const jungles = getEnumValues(Jungle)

/**
 * How many spaces of each kind a card carries, counted off the artwork.
 *
 * The rules need both: a Dig Site may only be built once every Archaeologist space of the card is
 * occupied (rulebook p.7), and the Animal bonus is taken once every Animal space is (p.5). The
 * display needs them too, because each column is aligned on the bottom of the card — a card with
 * fewer spaces is missing the *top* ones — so where the first space of a column sits cannot be
 * known from the card alone.
 */
const archaeologistSpaces: Record<Jungle, number> = {
  [Jungle.Jungle1]: 2,
  [Jungle.Jungle2]: 2,
  [Jungle.Jungle3]: 1,
  [Jungle.Jungle4]: 2,
  [Jungle.Jungle5]: 3,
  [Jungle.Jungle6]: 1,
  [Jungle.Jungle7]: 4,
  [Jungle.Jungle8]: 4,
  [Jungle.Jungle9]: 3,
  [Jungle.Jungle10]: 1,
  [Jungle.Jungle11]: 3,
  [Jungle.Jungle12]: 2,
  [Jungle.Jungle13]: 2,
  [Jungle.Jungle14]: 3,
  [Jungle.Jungle15]: 2,
  [Jungle.Jungle16]: 2,
  [Jungle.Jungle17]: 3,
  [Jungle.Jungle18]: 3,
  [Jungle.Jungle19]: 4,
  [Jungle.Jungle20]: 3
}

export const getArchaeologistSpaces = (jungle: Jungle): number => archaeologistSpaces[jungle]

const animalSpaces: Record<Jungle, number> = {
  [Jungle.Jungle1]: 1,
  [Jungle.Jungle2]: 4,
  [Jungle.Jungle3]: 2,
  [Jungle.Jungle4]: 3,
  [Jungle.Jungle5]: 3,
  [Jungle.Jungle6]: 2,
  [Jungle.Jungle7]: 3,
  [Jungle.Jungle8]: 4,
  [Jungle.Jungle9]: 4,
  [Jungle.Jungle10]: 4,
  [Jungle.Jungle11]: 1,
  [Jungle.Jungle12]: 3,
  [Jungle.Jungle13]: 3,
  [Jungle.Jungle14]: 2,
  [Jungle.Jungle15]: 2,
  [Jungle.Jungle16]: 3,
  [Jungle.Jungle17]: 2,
  [Jungle.Jungle18]: 3,
  [Jungle.Jungle19]: 2,
  [Jungle.Jungle20]: 1
}

export const getAnimalSpaces = (jungle: Jungle): number => animalSpaces[jungle]

/**
 * The three bonuses printed at the foot of a Jungle card, from left to right: the one the Dig Site
 * unlocks, the one the Animal pawns unlock, and the Exploration bonus that both of them together
 * unlock (rulebook p.5).
 *
 * A bonus space may be empty — it is then an empty list, and it still has to be *obtained* for the
 * Exploration bonus to come.
 */
export type JungleBonuses = {
  digSite: Effect[]
  animal: Effect[]
  exploration: Effect[]
}

/**
 * Read off the bonus bar at the foot of each card: the locked box on the left is the Dig Site one,
 * the box on the right the Animal one, and the one in the middle, which both of them feed, the
 * Exploration bonus. Jungle 17 has no middle box at all — turning the card over is all it gives.
 */
const jungleBonuses: Record<Jungle, JungleBonuses> = {
  [Jungle.Jungle1]: { digSite: [sendArchaeologists(1)], animal: [], exploration: [relicTile, gold(3)] },
  [Jungle.Jungle2]: { digSite: [sendArchaeologists(1)], animal: [legendaryAnimalTile(LegendaryAnimal.LegendaryAnimal5)], exploration: [relicTile] },
  [Jungle.Jungle3]: { digSite: [], animal: [], exploration: [templeTile] },
  [Jungle.Jungle4]: { digSite: [animalOnEachJungle], animal: [], exploration: [relicTile] },
  [Jungle.Jungle5]: { digSite: [animalOnEachJungle, gold(3)], animal: [], exploration: [relicTile] },
  [Jungle.Jungle6]: { digSite: [animalOnEachJungle], animal: [], exploration: [relicTile] },
  [Jungle.Jungle7]: { digSite: [relicTile], animal: [legendaryAnimalTile(LegendaryAnimal.LegendaryAnimal7)], exploration: [sendArchaeologists(1)] },
  [Jungle.Jungle8]: { digSite: [], animal: [legendaryAnimalTile(LegendaryAnimal.LegendaryAnimal6)], exploration: [templeTile] },
  [Jungle.Jungle9]: { digSite: [animalOnEachJungle], animal: [legendaryAnimalTile(LegendaryAnimal.LegendaryAnimal1)], exploration: [relicTile] },
  [Jungle.Jungle10]: { digSite: [], animal: [legendaryAnimalTile(LegendaryAnimal.LegendaryAnimal9)], exploration: [relicTile] },
  [Jungle.Jungle11]: { digSite: [], animal: [], exploration: [templeTile] },
  [Jungle.Jungle12]: { digSite: [animalOnEachJungle], animal: [], exploration: [relicTile] },
  [Jungle.Jungle13]: { digSite: [], animal: [legendaryAnimalTile(LegendaryAnimal.LegendaryAnimal8)], exploration: [relicTile, gold(3)] },
  [Jungle.Jungle14]: { digSite: [], animal: [], exploration: [templeTile] },
  [Jungle.Jungle15]: { digSite: [animalOnEachJungle], animal: [], exploration: [sendArchaeologists(1), relicTile] },
  [Jungle.Jungle16]: { digSite: [sendArchaeologists(1)], animal: [legendaryAnimalTile(LegendaryAnimal.LegendaryAnimal4)], exploration: [relicTile] },
  [Jungle.Jungle17]: { digSite: [relicTile], animal: [legendaryAnimalTile(LegendaryAnimal.LegendaryAnimal3)], exploration: [] },
  [Jungle.Jungle18]: { digSite: [relicTile], animal: [legendaryAnimalTile(LegendaryAnimal.LegendaryAnimal2)], exploration: [sendArchaeologists(1)] },
  [Jungle.Jungle19]: { digSite: [], animal: [], exploration: [templeTile, gold(3)] },
  [Jungle.Jungle20]: { digSite: [relicTile], animal: [], exploration: [gold(3)] }
}

export const getJungleBonuses = (jungle: Jungle): JungleBonuses => jungleBonuses[jungle]

/**
 * The Plant symbols a card is worth for the Fame objective, 0 to 2 of them, as the green badges in
 * the top left corner — not to be mistaken for the white palm every card carries top right, which
 * only says it is a Jungle card. They are printed on both faces on purpose: a completed card keeps
 * counting (rulebook p.8).
 */
const plantIcons: Record<Jungle, number> = {
  [Jungle.Jungle1]: 0,
  [Jungle.Jungle2]: 1,
  [Jungle.Jungle3]: 0,
  [Jungle.Jungle4]: 2,
  [Jungle.Jungle5]: 0,
  [Jungle.Jungle6]: 1,
  [Jungle.Jungle7]: 1,
  [Jungle.Jungle8]: 0,
  [Jungle.Jungle9]: 1,
  [Jungle.Jungle10]: 1,
  [Jungle.Jungle11]: 0,
  [Jungle.Jungle12]: 2,
  [Jungle.Jungle13]: 0,
  [Jungle.Jungle14]: 1,
  [Jungle.Jungle15]: 1,
  [Jungle.Jungle16]: 0,
  [Jungle.Jungle17]: 0,
  [Jungle.Jungle18]: 0,
  [Jungle.Jungle19]: 0,
  [Jungle.Jungle20]: 1
}

export const getPlantIcons = (jungle: Jungle): number => plantIcons[jungle]
