/**
 * @vitest-environment jsdom
 *
 * The tutorial wrapper is pure rules, but it is reached through packages that touch `document` and
 * `localStorage` as they load. Nothing here uses the DOM: it is only there to let them import.
 */
import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { TILES_TO_WIN } from '@gamepark/aurealis/Constants'
import { Fame } from '@gamepark/aurealis/material/Fame'
import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { isTemple } from '@gamepark/aurealis/material/Temple'
import { Tile } from '@gamepark/aurealis/material/Tile'
import { wrapRulesWithTutorial } from '@gamepark/react-game/dist/components/tutorial/TutorialRulesWrapper'
import { applyAutomaticMoves, hasRandomMove, Material, MaterialGame, MaterialMove, MoveKind } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'

import { AurealisTutorial } from './AurealisTutorial'
import { tutorialOpponent, tutorialPlayer } from './TutorialSetup'

type Game = MaterialGame<number, MaterialType, LocationType>

/** Enough to walk the whole script several times over: a run that needs more is a run that loops. */
const MOVE_LIMIT = 500

/**
 * The tutorial played through the way a reader plays it, without a browser.
 *
 * At every step the framework is asked what is legal, exactly as the interface asks it, and one of
 * those moves is played. The step's own popup is closed only when there is nothing else to do, which
 * is what happens on screen while a step is holding consequences back: the framework then offers the
 * popup and nothing else (see wrapRulesWithTutorial).
 *
 * What this catches is the one thing reading the code cannot settle — a step whose filter matches no
 * legal move, or an interrupt that never fires — either of which leaves the reader stuck on a popup
 * with nothing to click.
 */
const playTutorial = (): { game: Game; steps: number } => {
  const tutorial = new AurealisTutorial()
  wrapRulesWithTutorial(tutorial as never, AurealisRules as never)
  const [game] = tutorial.setupTutorial()
  const rules = new AurealisRules(game)
  let played = 0
  while (game.tutorial!.step < tutorial.steps.length) {
    const step = tutorial.steps[game.tutorial!.step]
    const player = step?.move?.player ?? game.players[0]
    const moves = rules.getLegalMoves(player) as MaterialMove[]
    expect(moves, `no legal move at step ${game.tutorial!.step}`).not.toHaveLength(0)
    // The action of the step first, its popup last: a popup is all that is left when the framework
    // is holding consequences back, and closing it is then what lets them play.
    const move = moves.find((candidate) => candidate.kind !== MoveKind.LocalMove) ?? moves[0]
    const randomized = hasRandomMove(rules) ? rules.randomize(move as never) : move
    applyAutomaticMoves(rules, [randomized] as never)
    expect(++played, 'the tutorial did not reach its last step').toBeLessThan(MOVE_LIMIT)
  }
  return { game, steps: tutorial.steps.length }
}

const material = (game: Game, type: MaterialType) => new Material(type, game.items[type])

const tilesOf = (game: Game, player: number) => material(game, MaterialType.Tile).location(LocationType.PlayerTiles).player(player)

const junglesOf = (game: Game, player: number) =>
  material(game, MaterialType.JungleCard).location(LocationType.PlayerJungle).player(player)

describe('The Aurealis tutorial', () => {
  it('can be played from the first popup to the last', () => {
    for (let run = 0; run < 5; run++) {
      const { game, steps } = playTutorial()
      expect(game.tutorial!.step).toBe(steps)
    }
  })

  it('leaves the reader with the 3 Jungle cards and the Renommée the last popups talk about', () => {
    const { game } = playTutorial()
    expect(junglesOf(game, tutorialPlayer).length).toBe(3)
    expect(tilesOf(game, tutorialPlayer).id(Fame.Jungle).length).toBe(1)
    // The Renommée Plante must not have come along with it: the popups only explain the other one.
    expect(tilesOf(game, tutorialPlayer).id(Fame.Plant).length).toBe(0)
    // And nothing may be won that the tutorial has not shown, least of all the game itself.
    expect(tilesOf(game, tutorialPlayer).length).toBeLessThan(TILES_TO_WIN)
    expect(tilesOf(game, tutorialPlayer).id(isTemple).length).toBe(0)
  })

  it('leaves the reader with the 7 gold the Camp de base was paid with taken out', () => {
    const { game } = playTutorial()
    // 3 at the start, 7 from the Cheffe d'expédition, 3 for the Exploratrice, 5 for the Camp de base.
    const gold = material(game, MaterialType.Coin)
      .location(LocationType.PlayerCoins)
      .player(tutorialPlayer)
      .getItems()
      .reduce((total, coin) => total + coin.id * (coin.quantity ?? 1), 0)
    expect(gold).toBe(3 + 7 - 3 - 5)
  })

  it('leaves the opponent with the 2 tiles their card gave them, and a completed Jungle', () => {
    const { game } = playTutorial()
    const tiles = tilesOf(game, tutorialOpponent)
    expect(tiles.id(Tile.Relic).length).toBe(1)
    expect(tiles.id((id: Tile) => id >= Tile.LegendaryAnimal1 && id <= Tile.LegendaryAnimal9).length).toBe(1)
    expect(junglesOf(game, tutorialOpponent).getItems()[0].location.rotation).toBe(true)
  })
})
