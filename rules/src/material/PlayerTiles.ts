import { LocationType } from './LocationType'
import { MaterialSource } from './MaterialSource'
import { MaterialType } from './MaterialType'

/**
 * The four kinds of tile that pile up in front of a player and count towards the {@link TILES_TO_WIN}
 * that end the game (rulebook p.11): the Discovery tiles — Relic, Temple, Legendary Animal — and the
 * Fame tiles, which are held rather than won and can go back to the opponent.
 *
 * The Instant Victory tile is not one of them: it is not something a player collects towards
 * anything, it is the game being over (see {@link ChooseTempleTileRule}).
 */
export const TILE_TYPES = [MaterialType.RelicTile, MaterialType.TempleTile, MaterialType.LegendaryAnimalTile, MaterialType.FameTile]

/** How far a player is along the 7 tiles that win the game. */
export const countPlayerTiles = (source: MaterialSource, player: number): number =>
  TILE_TYPES.reduce((total, type) => total + source.material(type).location(LocationType.PlayerTiles).player(player).length, 0)
