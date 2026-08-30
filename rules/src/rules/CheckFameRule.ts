import { Fame, fames, fameScore, fameThresholds } from '../material/Fame'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Memory } from '../Memory'
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
   *
   * Proved it during this very turn: a tile is won by *acquiring* something towards its objective,
   * never by owning what one already owned. Without that, two players tied on an objective would
   * pass the tile back and forth turn after turn without either of them doing anything for it — the
   * one who just lost it would equal the other again on their own turn, and take it straight back.
   */
  get fameMoves(): AurealisMove[] {
    const before = this.remind<Record<Fame, number>>(Memory.FameAtTurnStart)
    const moves: AurealisMove[] = []
    for (const fame of fames) {
      const tile = this.material(MaterialType.Tile).id(fame)
      const owner = tile.getItems()[0]?.location.player
      if (owner === this.player) continue
      const score = fameScore(this, fame, this.player)
      if (score < fameThresholds[fame]) continue
      if (score <= (before?.[fame] ?? 0)) continue
      if (owner !== undefined && score < fameScore(this, fame, owner)) continue
      moves.push(tile.moveItem({ type: LocationType.PlayerTiles, player: this.player }))
    }
    return moves
  }
}
