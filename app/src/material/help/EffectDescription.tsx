import { Effect, EffectType } from '@gamepark/aurealis/material/Effect'
import { FC } from 'react'
import { Trans } from 'react-i18next'
import { helpBlock } from './helpStyles'

/**
 * What an effect gives, in words. The box prints the very same icons on the Adventurer cards, the
 * Jungle bonuses, the Temple tiles and the Camp de base (rulebook p.12), so one reading of them
 * serves all four — which is what lets every help dialog of the game describe a gain the same way.
 */
export const EffectText: FC<{ effect: Effect }> = ({ effect }) => {
  switch (effect.type) {
    case EffectType.Gold:
      return <Trans i18nKey="effect.gold" values={{ gold: effect.gold }} />
    case EffectType.ArchaeologistMoves:
      return <Trans i18nKey="effect.moves" values={{ count: effect.count }} />
    case EffectType.MovesOrGold:
      return <Trans i18nKey="effect.moves-or-gold" values={{ count: effect.count }} />
    case EffectType.SendArchaeologists:
      return <Trans i18nKey="effect.send-archaeologists" values={{ count: effect.count }} />
    case EffectType.PlaceAnimals:
      return <Trans i18nKey="effect.place-animals" values={{ count: effect.count }} />
    case EffectType.AnimalOnEachJungle:
      return <Trans i18nKey="effect.animal-on-each-jungle" />
    case EffectType.BuyJungle:
      return <Trans i18nKey={buyJungleKey(effect.cost, effect.fromDeckBottom)} values={{ cost: effect.cost }} />
    case EffectType.RelicTile:
      return <Trans i18nKey="effect.relic-tile" />
    case EffectType.TempleTile:
      return <Trans i18nKey="effect.temple-tile" />
    case EffectType.LegendaryAnimalTile:
      return <Trans i18nKey="effect.legendary-animal-tile" values={{ animal: effect.animal }} />
    // Nothing to read: a bonus waiting its turn in the queue is printed on no card, and what it will
    // give is already written at the foot of the one it belongs to. No more is the Camp de base
    // turning over, which is not a gain at all.
    case EffectType.JungleDue:
    case EffectType.FlipBaseCamp:
      return null
    // A slash on the card: one of the two, never both. Read as one sentence rather than a list,
    // because that is what it is — a single gain the player has yet to settle.
    case EffectType.Choice:
      return (
        <>
          {effect.options.map((option, index) => (
            <span key={index}>
              {index > 0 && <Trans i18nKey="effect.or" />}
              <EffectText effect={option} />
            </span>
          ))}
        </>
      )
  }
}

/**
 * A purchase at 0 is not a purchase, and the 3 cards at the bottom of the Jungle deck are not the
 * market: three sentences rather than one with holes in it.
 */
const buyJungleKey = (cost: number, fromDeckBottom?: boolean): string => {
  if (fromDeckBottom) return 'effect.buy-jungle.deck-bottom'
  return cost > 0 ? 'effect.buy-jungle' : 'effect.take-jungle'
}

/**
 * The gains of one line, of one power or of one bonus. Side by side they are all applied, one after
 * the other — a slash is a {@link EffectType.Choice}, and stays inside a single item of the list.
 */
export const Effects: FC<{ effects: Effect[] }> = ({ effects }) => {
  if (!effects.length) return null
  if (effects.length === 1) {
    return (
      <div css={helpBlock}>
        <EffectText effect={effects[0]} />
      </div>
    )
  }
  return (
    <div css={helpBlock}>
      <ul>
        {effects.map((effect, index) => (
          <li key={index}>
            <EffectText effect={effect} />
          </li>
        ))}
      </ul>
    </div>
  )
}
