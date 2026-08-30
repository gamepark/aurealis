import { getPlantIcons, Jungle } from './Jungle'
import { playerJungleCards } from './JungleState'
import { isLegendaryAnimal } from './LegendaryAnimal'
import { LocationType } from './LocationType'
import { MaterialSource } from './MaterialSource'
import { MaterialType } from './MaterialType'
import { getTemplePlantIcons, isTemple, Temple } from './Temple'
import { Tile } from './Tile'

/**
 * The 4 Fame tiles. Each is held by whoever currently leads on its criterion, and moves from one
 * player to the other during the game.
 *
 * A named subset of {@link Tile}, like the other kinds of tile.
 */
export const Fame = {
  /** 3 Plant symbols */
  Plant: Tile.FamePlant,
  /** 3 Jungle cards */
  Jungle: Tile.FameJungle,
  /** 2 Legendary Animal tiles */
  LegendaryAnimal: Tile.FameLegendaryAnimal,
  /** 2 Relic tiles */
  Relic: Tile.FameRelic
} as const

export type Fame = (typeof Fame)[keyof typeof Fame]

export const fames: Fame[] = Object.values(Fame)

export const isFame = (tile: Tile): tile is Fame => fames.includes(tile as Fame)

/**
 * What it takes to hold a Fame tile (rulebook p.10). A tile is never won for good: at the end of a
 * turn its owner loses it to the other player as soon as that player *equals* them on the objective.
 */
export const fameThresholds: Record<Fame, number> = {
  [Fame.Plant]: 3,
  [Fame.Jungle]: 3,
  [Fame.LegendaryAnimal]: 2,
  [Fame.Relic]: 2
}

/**
 * How far a player is along one of the four objectives. Read here rather than in the rule that
 * checks it, because it is asked twice: at the end of a turn to hand the tiles out, and at the
 * start of it to record where the player stood (see {@link CheckFameRule}).
 */
export const fameScore = (source: MaterialSource, fame: Fame, player: number): number => {
  switch (fame) {
    case Fame.Plant:
      return (
        playerJungleCards(source, player)
          .getItems<Jungle>()
          .reduce((total, card) => total + getPlantIcons(card.id), 0) +
        source
          .material(MaterialType.Tile)
          .location(LocationType.PlayerTiles)
          .player(player)
          .id(isTemple)
          .getItems<Temple>()
          .reduce((total, tile) => total + getTemplePlantIcons(tile.id), 0)
      )
    case Fame.Jungle:
      return playerJungleCards(source, player).length
    case Fame.LegendaryAnimal:
      return source.material(MaterialType.Tile).location(LocationType.PlayerTiles).player(player).id(isLegendaryAnimal).length
    case Fame.Relic:
      return source.material(MaterialType.Tile).location(LocationType.PlayerTiles).player(player).id(Tile.Relic).length
  }
}

/** The four objectives at once, as they are recorded at the start of a turn. */
export const fameScores = (source: MaterialSource, player: number): Record<Fame, number> =>
  Object.fromEntries(fames.map((fame) => [fame, fameScore(source, fame, player)])) as Record<Fame, number>
