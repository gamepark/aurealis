import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { getAnimalSpaces, getArchaeologistSpaces, getJungleBonuses, getPlantIcons, Jungle } from '@gamepark/aurealis/material/Jungle'
import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { Effect } from '@gamepark/aurealis/material/Effect'
import { MaterialHelpProps, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Effects } from './EffectDescription'
import { helpBlock, helpBlockActive, helpIntro, helpLocation, helpSection, helpTitle } from './helpStyles'

/**
 * A Jungle card: the two columns of spaces printed down its edges, and the three bonuses at its foot.
 *
 * The three are given in the order they can be obtained, because that order is the card: the Dig Site
 * one and the Animal one are earned apart, and the Exploration one is what having earned both is
 * worth (rulebook p.5). A bonus already taken is marked as such — half of what a player asks a card
 * is what is still left on it.
 */
export const JungleCardHelp: FC<MaterialHelpProps> = ({ item, itemIndex }) => {
  const { t } = useTranslation()
  const rules = useRules<AurealisRules>()
  const jungle = item.id as Jungle | undefined
  if (!rules || jungle === undefined) return null
  const bonuses = getJungleBonuses(jungle)
  const completed = !!item.location?.rotation
  const plants = getPlantIcons(jungle)
  const owned = item.location?.type === LocationType.PlayerJungle
  // A completed card has neither spaces nor pawns left on them: what it holds is no longer a count.
  const inPlay = owned && !completed && itemIndex !== undefined
  return (
    <>
      <h2 css={helpTitle}>{t('help.jungle.title')}</h2>
      <p css={helpIntro}>
        <Trans i18nKey="help.jungle.intro" />
      </p>

      <div css={helpSection}>{t('help.jungle.spaces')}</div>
      {/* How many of them are taken is only worth saying of a card that is in play: on the market a
          card carries nothing, and "0 occupied" would be answering a question nobody asked. */}
      <div css={helpBlock}>
        <ul>
          <li>
            {inPlay ? (
              <Trans i18nKey="help.jungle.archaeologist-spaces.taken" values={{ count: getArchaeologistSpaces(jungle), taken: archaeologistsOnSlots(rules, itemIndex!) }} />
            ) : (
              <Trans i18nKey="help.jungle.archaeologist-spaces" values={{ count: getArchaeologistSpaces(jungle) }} />
            )}
          </li>
          <li>
            {inPlay ? (
              <Trans i18nKey="help.jungle.animal-spaces.taken" values={{ count: getAnimalSpaces(jungle), taken: animalPawnsOn(rules, itemIndex!) }} />
            ) : (
              <Trans i18nKey="help.jungle.animal-spaces" values={{ count: getAnimalSpaces(jungle) }} />
            )}
          </li>
        </ul>
      </div>

      <JungleBonus title="help.jungle.dig-site-bonus" rule="help.jungle.dig-site-rule" effects={bonuses.digSite} taken={completed || digSiteBuilt(rules, itemIndex, owned)} />
      <JungleBonus title="help.jungle.animal-bonus" rule="help.jungle.animal-rule" effects={bonuses.animal} taken={completed || animalBonusTaken(rules, itemIndex, owned)} />
      <JungleBonus title="help.jungle.exploration-bonus" rule="help.jungle.exploration-rule" effects={bonuses.exploration} taken={completed} />

      <p css={helpIntro}>
        <Trans i18nKey="help.jungle.plants" values={{ count: plants }} />
      </p>
      <JungleCardLocation item={item} completed={completed} />
    </>
  )
}

/**
 * One of the three bonuses: what unlocks it, and what it gives. A bonus that gives nothing is still
 * worth a block of its own — it has to be *obtained* all the same for the Exploration bonus to come.
 */
const JungleBonus: FC<{ title: string, rule: string, effects: Effect[], taken: boolean }> = ({ title, rule, effects, taken }) => {
  const { t } = useTranslation()
  return (
    <>
      <div css={helpSection}>{t(title)}</div>
      <div css={[helpBlock, !taken && helpBlockActive]}>
        <Trans i18nKey={rule} />
        {effects.length ? <Effects effects={effects} /> : <p>{t('help.jungle.no-gain')}</p>}
        {taken && <p>{t('help.jungle.already-taken')}</p>}
      </div>
    </>
  )
}

const archaeologistsOnSlots = (rules: AurealisRules, card: number): number =>
  rules.material(MaterialType.ArchaeologistPawn).location(LocationType.JungleArchaeologistSpace).parent(card).length

const animalPawnsOn = (rules: AurealisRules, card: number): number =>
  rules.material(MaterialType.AnimalPawn).location(LocationType.JungleAnimalSpace).parent(card).length

/** The pawn sitting on a bonus space is the record that the bonus was obtained (rulebook p.5). */
const digSiteBuilt = (rules: AurealisRules, card: number | undefined, owned: boolean): boolean =>
  owned && card !== undefined && rules.material(MaterialType.DigSitePawn).location(LocationType.JungleDigSiteBonus).parent(card).length > 0

const animalBonusTaken = (rules: AurealisRules, card: number | undefined, owned: boolean): boolean =>
  owned && card !== undefined && rules.material(MaterialType.AnimalPawn).location(LocationType.JungleAnimalBonus).parent(card).length > 0

/** On the market, or in someone's jungle — and there, on which of its two faces. */
const JungleCardLocation: FC<Pick<MaterialHelpProps, 'item'> & { completed: boolean }> = ({ item, completed }) => {
  const player = usePlayerId<number>()
  const name = usePlayerName(item.location?.player)
  const mine = item.location?.player !== undefined && item.location.player === player
  switch (item.location?.type) {
    case LocationType.JungleDeck:
    case LocationType.JungleMarket:
      return (
        <p css={helpLocation}>
          <Trans i18nKey="help.jungle.on-market" />
        </p>
      )
    case LocationType.PlayerJungle:
      return (
        <p css={helpLocation}>
          <Trans i18nKey={mine ? 'help.jungle.in-my-jungle' : 'help.jungle.in-jungle'} values={{ player: name }} />
          {completed && <Trans i18nKey="help.jungle.completed" />}
        </p>
      )
    default:
      return null
  }
}
