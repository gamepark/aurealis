import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { TILES_TO_WIN } from '@gamepark/aurealis/Constants'
import { Fame, fameThresholds } from '@gamepark/aurealis/material/Fame'
import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { countPlayerTiles } from '@gamepark/aurealis/material/PlayerTiles'
import { getTempleEffects, getTemplePlantIcons, Temple } from '@gamepark/aurealis/material/Temple'
import { MaterialHelpProps, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Effects } from './EffectDescription'
import { helpBlock, helpIntro, helpLocation, helpSection, helpTitle } from './helpStyles'

/**
 * The tiles a player wins, all 3 x 3 cm and all worth the same one thing in the end: 7 of them in
 * front of a player at the start of their turn wins the game (rulebook p.11). What tells them apart
 * is how they are earned, and what they are worth to the Fame objectives on the way.
 *
 * Hence the footer every one of them carries: whatever a tile is, it is first of all one seventh of
 * a victory, and that is the sentence a player needs under each of them.
 */

/** Where a tile counts, and how far its owner is along the 7 that end the game. */
const TilesToWin: FC<Pick<MaterialHelpProps, 'item'>> = ({ item }) => {
  const rules = useRules<AurealisRules>()
  const player = usePlayerId<number>()
  const name = usePlayerName(item.location?.player)
  const owner = item.location?.type === LocationType.PlayerTiles ? item.location.player : undefined
  return (
    <p css={helpLocation}>
      <Trans i18nKey="help.tile.to-win" values={{ total: TILES_TO_WIN }} />
      {rules && owner !== undefined && (
        <Trans
          i18nKey={owner === player ? 'help.tile.owned.mine' : 'help.tile.owned'}
          values={{ player: name, count: countPlayerTiles(rules, owner), total: TILES_TO_WIN }}
        />
      )}
    </p>
  )
}

/**
 * A Temple tile, won through the Exploration bonus of a Jungle card: it is chosen among those on
 * display and its effect is applied at once (rulebook p.12).
 *
 * A player never holds a third one — the third is the Instant Victory tile instead — so the tile is
 * both a gain and a countdown, which is the one thing the artwork does not say.
 */
export const TempleTileHelp: FC<MaterialHelpProps> = ({ item }) => {
  const { t } = useTranslation()
  const temple = item.id as Temple | undefined
  if (temple === undefined) return null
  const plants = getTemplePlantIcons(temple)
  return (
    <>
      <h2 css={helpTitle}>{t('help.temple.title')}</h2>
      <p css={helpIntro}>
        <Trans i18nKey="help.temple.intro" />
      </p>
      <div css={helpSection}>{t('help.temple.effect')}</div>
      <Effects effects={getTempleEffects(temple)} />
      {plants > 0 && (
        <p css={helpIntro}>
          <Trans i18nKey="help.temple.plants" values={{ count: plants }} />
        </p>
      )}
      <div css={helpSection}>{t('help.temple.third')}</div>
      <div css={helpBlock}>
        <Trans i18nKey="help.temple.third-text" />
      </div>
      <TilesToWin item={item} />
    </>
  )
}

/**
 * A Fame tile: the one tile that is held rather than won. It goes to whoever last proved they deserve
 * it, and equalling its holder is enough to take it (rulebook p.10) — so it is never safe, and that
 * is what has to be said before its threshold.
 */
export const FameTileHelp: FC<MaterialHelpProps> = ({ item }) => {
  const { t } = useTranslation()
  const fame = item.id as Fame | undefined
  if (fame === undefined) return null
  return (
    <>
      <h2 css={helpTitle}>{t('help.fame.title')}</h2>
      <p css={helpIntro}>
        <Trans i18nKey="help.fame.intro" />
      </p>
      <div css={helpSection}>{t('help.fame.objective')}</div>
      <div css={helpBlock}>
        <Trans i18nKey={`help.fame.objective.${fame}`} values={{ count: fameThresholds[fame] }} />
      </div>
      <div css={helpSection}>{t('help.fame.changing-hands')}</div>
      <div css={helpBlock}>
        <Trans i18nKey="help.fame.changing-hands-text" />
      </div>
      <FameHolder item={item} />
      <TilesToWin item={item} />
    </>
  )
}

/** Who holds it right now — a Fame tile on the display is one nobody has yet earned. */
const FameHolder: FC<Pick<MaterialHelpProps, 'item'>> = ({ item }) => {
  const player = usePlayerId<number>()
  const name = usePlayerName(item.location?.player)
  const mine = item.location?.player !== undefined && item.location.player === player
  return (
    <p css={helpIntro}>
      {item.location?.type === LocationType.PlayerTiles ? (
        <Trans i18nKey={mine ? 'help.fame.mine' : 'help.fame.player'} values={{ player: name }} />
      ) : (
        <Trans i18nKey="help.fame.unclaimed" />
      )}
    </p>
  )
}

/** The Relic tiles are 9 identical tiles: what one of them is worth is all there is to say. */
export const RelicTileHelp: FC<MaterialHelpProps> = ({ item }) => {
  const { t } = useTranslation()
  return (
    <>
      <h2 css={helpTitle}>{t('help.relic.title')}</h2>
      <p css={helpIntro}>
        <Trans i18nKey="help.relic.intro" />
      </p>
      <div css={helpBlock}>
        <Trans i18nKey="help.relic.fame" values={{ count: fameThresholds[Fame.Relic] }} />
      </div>
      <TilesToWin item={item} />
    </>
  )
}

/**
 * A Legendary Animal tile, and there are 9 different ones: which one a Jungle card gives is printed
 * on the card, so the tile is not chosen — it is met.
 */
export const LegendaryAnimalTileHelp: FC<MaterialHelpProps> = ({ item }) => {
  const { t } = useTranslation()
  return (
    <>
      <h2 css={helpTitle}>{t('help.legendary-animal.title')}</h2>
      <p css={helpIntro}>
        <Trans i18nKey="help.legendary-animal.intro" />
      </p>
      <div css={helpBlock}>
        <Trans i18nKey="help.legendary-animal.fame" values={{ count: fameThresholds[Fame.LegendaryAnimal] }} />
      </div>
      <TilesToWin item={item} />
    </>
  )
}

/**
 * The Instant Victory tile: not a tile a player collects, but the game being over. It is what a
 * player takes instead of a third Temple tile (rulebook p.11).
 */
export const InstantVictoryTileHelp: FC<MaterialHelpProps> = () => {
  const { t } = useTranslation()
  return (
    <>
      <h2 css={helpTitle}>{t('help.instant-victory.title')}</h2>
      <p css={helpIntro}>
        <Trans i18nKey="help.instant-victory.intro">
          <strong />
        </Trans>
      </p>
      <div css={helpBlock}>
        <Trans i18nKey="help.instant-victory.other-end" values={{ total: TILES_TO_WIN }} />
      </div>
    </>
  )
}
