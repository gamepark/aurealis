import { css } from '@emotion/react'
import { defaultTheme, GameTheme } from '@gamepark/react-game'
import background from '../images/background.jpg'
import { colors } from './colors'
import { fontBody, fontDisplay } from './typography'

const dialogContainer = css`
  box-shadow:
    0 0 0 0.1em rgba(189, 133, 44, 0.35),
    0 0.6em 1.5em rgba(0, 0, 0, 0.6);
`

const buttonBase = css`
  background: ${colors.jungle} !important;
  color: ${colors.parchment} !important;
  border: 0.15em solid ${colors.gold} !important;
  border-radius: 0.3em !important;
  padding: 0.4em 1em !important;
  font-family: ${fontDisplay};
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow:
    0 0.2em 0.4em rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition:
    background 150ms ease,
    color 150ms ease,
    border-color 150ms ease,
    transform 120ms ease;
  outline: none !important;

  &:hover:not(:disabled),
  &:focus:hover:not(:disabled) {
    background: ${colors.gold} !important;
    color: ${colors.jungleDeep} !important;
    border-color: ${colors.goldDeep} !important;
  }

  &:focus:not(:hover):not(:disabled) {
    background: ${colors.jungle} !important;
    color: ${colors.parchment} !important;
    border-color: ${colors.goldLight} !important;
  }

  &:active:not(:disabled) {
    background: ${colors.jungleDeep} !important;
    color: ${colors.canvasLight} !important;
    border-color: ${colors.goldDeep} !important;
    transform: translateY(0.05em);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

const headerBar = css`
  background: rgba(26, 37, 31, 0.93);
  border-bottom: 0.15em solid ${colors.gold};
  color: ${colors.parchment};
  font-family: ${fontDisplay};
  box-shadow: 0 0.2em 0.5em rgba(0, 0, 0, 0.6);

  h1 {
    color: ${colors.parchment};
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  b,
  strong {
    color: ${colors.goldLight};
  }
`

const headerButtons = css`
  background: transparent !important;
  color: ${colors.parchment} !important;
  border: 0.08em solid rgba(246, 239, 221, 0.5) !important;
  border-radius: 0.3em !important;
  font-family: ${fontDisplay};
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  padding: 0 0.45em !important;
  box-shadow: none !important;
  outline: none !important;
  transition:
    background 150ms ease,
    color 150ms ease,
    border-color 150ms ease;

  &:hover:not(:disabled),
  &:focus:hover:not(:disabled) {
    background: ${colors.parchment} !important;
    color: ${colors.jungleDeep} !important;
    border-color: ${colors.parchment} !important;
  }

  &:focus:not(:hover):not(:disabled) {
    background: transparent !important;
    color: ${colors.parchment} !important;
    border-color: ${colors.goldLight} !important;
  }

  &:active:not(:disabled) {
    background: ${colors.gold} !important;
    color: ${colors.jungleDeep} !important;
    border-color: ${colors.gold} !important;
  }
`

const menuPanel = css`
  background: ${colors.jungleDeep};
  color: ${colors.parchment};
  border: 0.05em solid ${colors.jungle};
  box-shadow:
    0 0 0 0.1em rgba(189, 133, 44, 0.35),
    0 0.6em 1.5em rgba(0, 0, 0, 0.6);
  font-family: ${fontDisplay};

  h2 {
    color: ${colors.parchment};
    border-bottom: 0.15em solid ${colors.gold};
    padding-bottom: 0.3em;
    letter-spacing: 0.02em;
  }
`

const menuMainButton = css`
  background: ${colors.gold} !important;
  color: ${colors.jungleDeep} !important;
  border: 0.15em solid ${colors.goldDeep} !important;
  outline: none !important;

  &:hover:not(:disabled) {
    background: ${colors.goldDeep} !important;
    color: ${colors.parchment} !important;
  }

  &:focus:not(:hover):not(:disabled) {
    background: ${colors.gold} !important;
    color: ${colors.jungleDeep} !important;
  }
`

const playerPanelPanel = css`
  background: ${colors.jungleDeep};
  border: 0.08em solid ${colors.jungle};
  box-shadow: 0 0.2em 0.5em rgba(0, 0, 0, 0.5);
`

const playerPanelDataBadge = css`
  background: rgba(26, 37, 31, 0.85) !important;
  color: ${colors.parchment} !important;
  border: 0.08em solid ${colors.gold} !important;
  font-family: ${fontDisplay};
`

export const theme: GameTheme = {
  ...defaultTheme,
  root: {
    ...defaultTheme.root,
    fontFamily: fontBody,
    background: {
      ...defaultTheme.root.background,
      image: background
    }
  },
  palette: {
    primary: colors.jungle,
    primaryHover: colors.jungleLight,
    primaryActive: colors.jungleDeep,
    primaryLight: colors.parchment,
    primaryLighter: colors.canvasLight,
    surface: colors.jungleDeep,
    onSurface: colors.parchment,
    onSurfaceFocus: colors.jungle,
    onSurfaceActive: colors.jungleLight,
    danger: colors.clayLight,
    dangerHover: colors.clay,
    dangerActive: colors.clayDeep,
    disabled: '#6B6B6B'
  },
  buttons: buttonBase,
  dialog: {
    ...defaultTheme.dialog,
    backgroundColor: colors.jungleDeep,
    color: colors.parchment,
    container: dialogContainer,
    buttons: buttonBase
  },
  header: {
    bar: headerBar,
    buttons: headerButtons
  },
  menu: {
    panel: menuPanel,
    mainButton: menuMainButton
  },
  playerPanel: {
    activeRingColors: [colors.gold, colors.jungleLight],
    panel: playerPanelPanel,
    dataBadge: playerPanelDataBadge
  }
}
