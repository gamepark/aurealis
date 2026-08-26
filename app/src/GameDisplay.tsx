import { css } from '@emotion/react'
import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { DevToolsHub, GameTable, GameTableNavigation, useRules } from '@gamepark/react-game'
import { COMMON_AREA_RIGHT, jungleRowEnd, TABLE_HEIGHT, TABLE_LEFT } from './locators/TableLayout'
import { PlayerPanels } from './panels/PlayerPanels'

/**
 * The table is as small as the material allows, so that on a phone every card is as big as it can
 * be. Its shape is close to 16:9 once the 7 cm kept above it are counted: on such a screen it is the
 * width that limits the material, and there is no room left unused around it.
 *
 * The player panels are laid over the empty left end of the rows along the edges of the table, which
 * is why no margin is kept for them.
 *
 * The one thing that can make it grow is a jungle longer than the 6 cards it was drawn for. It then
 * grows to the right and to the right only: every other coordinate of the game is absolute, so the
 * common area stays exactly where it is and the material simply loses a little size — which is why
 * the table is not given that width from the start, for a length few games will ever reach.
 */
export function GameDisplay() {
  const margin = { top: 7, left: 0, right: 0, bottom: 0 }
  const xMax = Math.max(COMMON_AREA_RIGHT, jungleRowEnd(useLongestJungle()))
  return (
    <>
      <GameTable
        xMin={TABLE_LEFT}
        xMax={xMax}
        yMin={-TABLE_HEIGHT / 2}
        yMax={TABLE_HEIGHT / 2}
        margin={margin}
        css={process.env.NODE_ENV === 'development' && tableBorder}
      >
        <GameTableNavigation />
        <PlayerPanels />
        {process.env.NODE_ENV === 'development' && <DevToolsHub fabBottom="calc(5em)" />}
      </GameTable>
    </>
  )
}

/** The longest jungle in play: it is the row that reaches furthest right, whoever it belongs to. */
function useLongestJungle(): number {
  const rules = useRules<AurealisRules>()
  if (!rules) return 0
  return rules.players.reduce(
    (longest, player) => Math.max(longest, rules.material(MaterialType.JungleCard).location(LocationType.PlayerJungle).player(player).length),
    0
  )
}

const tableBorder = css`
  border: 1px solid white;
`
