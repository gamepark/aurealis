import { isMoveItemType } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Memory } from '../Memory'
import { AurealisItemMove, AurealisMove, AurealisRule, isOnJungleCard } from './AurealisRule'
import { RuleId } from './RuleId'

/**
 * "Send an Archaeologist onto any Jungle card, from your Camp de base or from another Jungle card"
 * (rulebook p.12): distance costs nothing here, which is what sets this apart from the moves of
 * {@link MoveArchaeologistsRule}.
 *
 * Pawns are sent one at a time, and nothing is ever declined. What is left is lost when there is
 * nowhere to send anyone: a player with a single Jungle card and every pawn already on it.
 */
export class SendArchaeologistsRule extends AurealisRule {
  onRuleStart(): AurealisMove[] {
    this.memorize(Memory.Remaining, this.currentEffectCount)
    return this.sendMoves.length ? [] : [this.startRule(RuleId.ResolveEffects)]
  }

  getPlayerMoves(): AurealisMove[] {
    return this.sendMoves
  }

  get sendMoves(): AurealisMove[] {
    const cards = this.jungleCards().getIndexes()
    const moves: AurealisMove[] = []
    for (const pawn of this.material(MaterialType.ArchaeologistPawn).location(LocationType.BaseCampArchaeologists).player(this.player).getIndexes()) {
      for (const card of cards) {
        moves.push(this.sendPawn(pawn, card))
      }
    }
    for (const from of cards) {
      for (const pawn of this.archaeologistsOn(from)) {
        for (const card of cards) {
          if (card !== from) moves.push(this.sendPawn(pawn, card))
        }
      }
    }
    return moves
  }

  private sendPawn(pawn: number, card: number): AurealisMove {
    return this.material(MaterialType.ArchaeologistPawn).index(pawn).moveItem(this.archaeologistDestination(card))
  }

  afterItemMove(move: AurealisItemMove): AurealisMove[] {
    const consequences = super.afterItemMove(move)
    if (isMoveItemType(MaterialType.ArchaeologistPawn)(move) && isOnJungleCard(move.location.type)) {
      return [...consequences, ...this.spendOne(this.sendMoves.length > 0)]
    }
    return consequences
  }
}
