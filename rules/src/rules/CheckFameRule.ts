import { Fame, fames, fameThresholds } from '../material/Fame'
import { getPlantIcons, Jungle } from '../material/Jungle'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { getTemplePlantIcons, Temple } from '../material/Temple'
import { AurealisMove, AurealisRule } from './AurealisRule'
import { RuleId } from './RuleId'

/**
 * Step III of a turn: the Fame is checked, and the tiles are given out or taken back (rulebook p.10).
 *
 * Nobody chooses anything here — the objectives are counted and the tiles follow — but it is a step
 * of the rulebook all the same, and a moment of the turn worth naming: a Fame tile changing hands is
 * the one thing that happens on a player's turn without them doing it.
 */
export class CheckFameRule extends AurealisRule {
  onRuleStart(): AurealisMove[] {
    return [...this.fameMoves, this.startRule(RuleId.RefillHand)]
  }

  getPlayerMoves(): AurealisMove[] {
    return []
  }

  /**
   * Only the player whose turn it is can take a Fame tile, and they take it from the opponent as
   * soon as they *equal* them on the objective — the tile goes to whoever last proved they deserve
   * it (rulebook p.10).
   */
  get fameMoves(): AurealisMove[] {
    const moves: AurealisMove[] = []
    for (const fame of fames) {
      const tile = this.material(MaterialType.FameTile).id(fame)
      const owner = tile.getItems()[0]?.location.player
      if (owner === this.player) continue
      const score = this.fameScore(fame, this.player)
      if (score < fameThresholds[fame]) continue
      if (owner !== undefined && score < this.fameScore(fame, owner)) continue
      moves.push(tile.moveItem({ type: LocationType.PlayerTiles, player: this.player }))
    }
    return moves
  }

  fameScore(fame: Fame, player: number): number {
    switch (fame) {
      case Fame.Plant:
        return (
          this.jungleCards(player)
            .getItems<Jungle>()
            .reduce((total, card) => total + getPlantIcons(card.id), 0) +
          this.material(MaterialType.TempleTile)
            .location(LocationType.PlayerTiles)
            .player(player)
            .getItems<Temple>()
            .reduce((total, tile) => total + getTemplePlantIcons(tile.id), 0)
        )
      case Fame.Jungle:
        return this.jungleCards(player).length
      case Fame.LegendaryAnimal:
        return this.material(MaterialType.LegendaryAnimalTile).location(LocationType.PlayerTiles).player(player).length
      case Fame.Relic:
        return this.material(MaterialType.RelicTile).location(LocationType.PlayerTiles).player(player).length
    }
  }
}
