import { MaterialGameSetup } from '@gamepark/rules-api'
import { AurealisOptions } from './AurealisOptions'
import { AurealisRules } from './AurealisRules'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { PlayerColor } from './PlayerColor'
import { RuleId } from './rules/RuleId'

/**
 * This class creates a new Game based on the game options
 */
export class AurealisSetup extends MaterialGameSetup<PlayerColor, MaterialType, LocationType, AurealisOptions> {
  Rules = AurealisRules

  setupMaterial(_options: AurealisOptions) {
    // TODO
  }

  start() {
    this.startPlayerTurn(RuleId.TheFirstStep, this.players[0])
  }
}
