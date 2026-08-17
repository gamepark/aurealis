import { AurealisOptionsSpecV2 } from '@gamepark/aurealis/AurealisOptions'
import { AurealisRules } from '@gamepark/aurealis/AurealisRules'
import { AurealisSetup } from '@gamepark/aurealis/AurealisSetup'
import { GameProvider } from '@gamepark/react-game'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { gameAnimations } from './animations/GameAnimations'
import { App } from './App'
import { Locators } from './locators/Locators'
import { Material } from './material/Material'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider
      game="aurealis"
      Rules={AurealisRules}
      optionsSpec={AurealisOptionsSpecV2}
      GameSetup={AurealisSetup}
      material={Material}
      locators={Locators}
      animations={gameAnimations}
    >
      <App />
    </GameProvider>
  </StrictMode>
)
