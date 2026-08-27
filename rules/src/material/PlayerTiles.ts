import { LocationType } from './LocationType'
import { MaterialSource } from './MaterialSource'
import { MaterialType } from './MaterialType'
import { Tile } from './Tile'

/** How far a player is along the 7 tiles that win the game (rulebook p.11). */
export const countPlayerTiles = (source: MaterialSource, player: number): number =>
  source
    .material(MaterialType.Tile)
    .location(LocationType.PlayerTiles)
    .player(player)
    .id((id: Tile) => id !== Tile.InstantVictory).length
