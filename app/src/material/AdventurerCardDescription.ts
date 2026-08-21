import { AdventurerBack, Adventurer, AdventurerId } from '@gamepark/aurealis/material/Adventurer'
import { LocationType } from '@gamepark/aurealis/material/LocationType'
import { MaterialType } from '@gamepark/aurealis/material/MaterialType'
import { CardDescription } from '@gamepark/react-game'
import naturalist1 from '../images/cards/adventurers/Naturalist1.jpg'
import naturalist2 from '../images/cards/adventurers/Naturalist2.jpg'
import naturalist3 from '../images/cards/adventurers/Naturalist3.jpg'
import naturalist4 from '../images/cards/adventurers/Naturalist4.jpg'
import naturalist5 from '../images/cards/adventurers/Naturalist5.jpg'
import naturalist6 from '../images/cards/adventurers/Naturalist6.jpg'
import naturalist7 from '../images/cards/adventurers/Naturalist7.jpg'
import naturalist8 from '../images/cards/adventurers/Naturalist8.jpg'
import naturalist9 from '../images/cards/adventurers/Naturalist9.jpg'
import naturalist10 from '../images/cards/adventurers/Naturalist10.jpg'
import naturalist11 from '../images/cards/adventurers/Naturalist11.jpg'
import naturalist12 from '../images/cards/adventurers/Naturalist12.jpg'
import naturalist13 from '../images/cards/adventurers/Naturalist13.jpg'
import archaeologist1 from '../images/cards/adventurers/Archaeologist1.jpg'
import archaeologist2 from '../images/cards/adventurers/Archaeologist2.jpg'
import archaeologist3 from '../images/cards/adventurers/Archaeologist3.jpg'
import archaeologist4 from '../images/cards/adventurers/Archaeologist4.jpg'
import archaeologist5 from '../images/cards/adventurers/Archaeologist5.jpg'
import archaeologist6 from '../images/cards/adventurers/Archaeologist6.jpg'
import archaeologist7 from '../images/cards/adventurers/Archaeologist7.jpg'
import archaeologist8 from '../images/cards/adventurers/Archaeologist8.jpg'
import archaeologist9 from '../images/cards/adventurers/Archaeologist9.jpg'
import archaeologist10 from '../images/cards/adventurers/Archaeologist10.jpg'
import archaeologist11 from '../images/cards/adventurers/Archaeologist11.jpg'
import archaeologist12 from '../images/cards/adventurers/Archaeologist12.jpg'
import archaeologist13 from '../images/cards/adventurers/Archaeologist13.jpg'
import explorer1 from '../images/cards/adventurers/Explorer1.jpg'
import explorer2 from '../images/cards/adventurers/Explorer2.jpg'
import explorer3 from '../images/cards/adventurers/Explorer3.jpg'
import explorer4 from '../images/cards/adventurers/Explorer4.jpg'
import explorer5 from '../images/cards/adventurers/Explorer5.jpg'
import explorer6 from '../images/cards/adventurers/Explorer6.jpg'
import explorer7 from '../images/cards/adventurers/Explorer7.jpg'
import explorer8 from '../images/cards/adventurers/Explorer8.jpg'
import explorer9 from '../images/cards/adventurers/Explorer9.jpg'
import explorer10 from '../images/cards/adventurers/Explorer10.jpg'
import explorer11 from '../images/cards/adventurers/Explorer11.jpg'
import explorer12 from '../images/cards/adventurers/Explorer12.jpg'
import explorer13 from '../images/cards/adventurers/Explorer13.jpg'
import expeditionLeader1 from '../images/cards/adventurers/ExpeditionLeader1.jpg'
import expeditionLeader2 from '../images/cards/adventurers/ExpeditionLeader2.jpg'
import expeditionLeader3 from '../images/cards/adventurers/ExpeditionLeader3.jpg'
import expeditionLeader4 from '../images/cards/adventurers/ExpeditionLeader4.jpg'
import expeditionLeader5 from '../images/cards/adventurers/ExpeditionLeader5.jpg'
import expeditionLeader6 from '../images/cards/adventurers/ExpeditionLeader6.jpg'
import expeditionLeader7 from '../images/cards/adventurers/ExpeditionLeader7.jpg'
import expeditionLeader8 from '../images/cards/adventurers/ExpeditionLeader8.jpg'
import expeditionLeader9 from '../images/cards/adventurers/ExpeditionLeader9.jpg'
import expeditionLeader10 from '../images/cards/adventurers/ExpeditionLeader10.jpg'
import expeditionLeader11 from '../images/cards/adventurers/ExpeditionLeader11.jpg'
import expeditionLeader12 from '../images/cards/adventurers/ExpeditionLeader12.jpg'
import expeditionLeader13 from '../images/cards/adventurers/ExpeditionLeader13.jpg'
import naturalistNaturalistBack from '../images/cards/adventurers/backs/NaturalistNaturalistBack.jpg'
import naturalistArchaeologistBack from '../images/cards/adventurers/backs/NaturalistArchaeologistBack.jpg'
import naturalistExplorerBack from '../images/cards/adventurers/backs/NaturalistExplorerBack.jpg'
import naturalistExpeditionLeaderBack from '../images/cards/adventurers/backs/NaturalistExpeditionLeaderBack.jpg'
import archaeologistNaturalistBack from '../images/cards/adventurers/backs/ArchaeologistNaturalistBack.jpg'
import archaeologistArchaeologistBack from '../images/cards/adventurers/backs/ArchaeologistArchaeologistBack.jpg'
import archaeologistExplorerBack from '../images/cards/adventurers/backs/ArchaeologistExplorerBack.jpg'
import archaeologistExpeditionLeaderBack from '../images/cards/adventurers/backs/ArchaeologistExpeditionLeaderBack.jpg'
import explorerNaturalistBack from '../images/cards/adventurers/backs/ExplorerNaturalistBack.jpg'
import explorerArchaeologistBack from '../images/cards/adventurers/backs/ExplorerArchaeologistBack.jpg'
import explorerExplorerBack from '../images/cards/adventurers/backs/ExplorerExplorerBack.jpg'
import explorerExpeditionLeaderBack from '../images/cards/adventurers/backs/ExplorerExpeditionLeaderBack.jpg'
import expeditionLeaderNaturalistBack from '../images/cards/adventurers/backs/ExpeditionLeaderNaturalistBack.jpg'
import expeditionLeaderArchaeologistBack from '../images/cards/adventurers/backs/ExpeditionLeaderArchaeologistBack.jpg'
import expeditionLeaderExplorerBack from '../images/cards/adventurers/backs/ExpeditionLeaderExplorerBack.jpg'
import expeditionLeaderExpeditionLeaderBack from '../images/cards/adventurers/backs/ExpeditionLeaderExpeditionLeaderBack.jpg'

/**
 * Adventurer cards are 44 x 70 mm. Their id is composite: `images` is keyed by `id.front` and
 * `backImages` by `id.back`, which the framework reads through getFrontId / getBackId. The default
 * `isFlipped` — front undefined — is what we want here: a card whose front is hidden shows its back,
 * and that back still tells the opponent the card's main and secondary types.
 */
class AdventurerCardDescription extends CardDescription<number, MaterialType, LocationType, AdventurerId> {
  width = 4.4
  height = 7

  images = {
    [Adventurer.Naturalist1]: naturalist1,
    [Adventurer.Naturalist2]: naturalist2,
    [Adventurer.Naturalist3]: naturalist3,
    [Adventurer.Naturalist4]: naturalist4,
    [Adventurer.Naturalist5]: naturalist5,
    [Adventurer.Naturalist6]: naturalist6,
    [Adventurer.Naturalist7]: naturalist7,
    [Adventurer.Naturalist8]: naturalist8,
    [Adventurer.Naturalist9]: naturalist9,
    [Adventurer.Naturalist10]: naturalist10,
    [Adventurer.Naturalist11]: naturalist11,
    [Adventurer.Naturalist12]: naturalist12,
    [Adventurer.Naturalist13]: naturalist13,
    [Adventurer.Archaeologist1]: archaeologist1,
    [Adventurer.Archaeologist2]: archaeologist2,
    [Adventurer.Archaeologist3]: archaeologist3,
    [Adventurer.Archaeologist4]: archaeologist4,
    [Adventurer.Archaeologist5]: archaeologist5,
    [Adventurer.Archaeologist6]: archaeologist6,
    [Adventurer.Archaeologist7]: archaeologist7,
    [Adventurer.Archaeologist8]: archaeologist8,
    [Adventurer.Archaeologist9]: archaeologist9,
    [Adventurer.Archaeologist10]: archaeologist10,
    [Adventurer.Archaeologist11]: archaeologist11,
    [Adventurer.Archaeologist12]: archaeologist12,
    [Adventurer.Archaeologist13]: archaeologist13,
    [Adventurer.Explorer1]: explorer1,
    [Adventurer.Explorer2]: explorer2,
    [Adventurer.Explorer3]: explorer3,
    [Adventurer.Explorer4]: explorer4,
    [Adventurer.Explorer5]: explorer5,
    [Adventurer.Explorer6]: explorer6,
    [Adventurer.Explorer7]: explorer7,
    [Adventurer.Explorer8]: explorer8,
    [Adventurer.Explorer9]: explorer9,
    [Adventurer.Explorer10]: explorer10,
    [Adventurer.Explorer11]: explorer11,
    [Adventurer.Explorer12]: explorer12,
    [Adventurer.Explorer13]: explorer13,
    [Adventurer.ExpeditionLeader1]: expeditionLeader1,
    [Adventurer.ExpeditionLeader2]: expeditionLeader2,
    [Adventurer.ExpeditionLeader3]: expeditionLeader3,
    [Adventurer.ExpeditionLeader4]: expeditionLeader4,
    [Adventurer.ExpeditionLeader5]: expeditionLeader5,
    [Adventurer.ExpeditionLeader6]: expeditionLeader6,
    [Adventurer.ExpeditionLeader7]: expeditionLeader7,
    [Adventurer.ExpeditionLeader8]: expeditionLeader8,
    [Adventurer.ExpeditionLeader9]: expeditionLeader9,
    [Adventurer.ExpeditionLeader10]: expeditionLeader10,
    [Adventurer.ExpeditionLeader11]: expeditionLeader11,
    [Adventurer.ExpeditionLeader12]: expeditionLeader12,
    [Adventurer.ExpeditionLeader13]: expeditionLeader13
  }

  backImages = {
    [AdventurerBack.NaturalistNaturalist]: naturalistNaturalistBack,
    [AdventurerBack.NaturalistArchaeologist]: naturalistArchaeologistBack,
    [AdventurerBack.NaturalistExplorer]: naturalistExplorerBack,
    [AdventurerBack.NaturalistExpeditionLeader]: naturalistExpeditionLeaderBack,
    [AdventurerBack.ArchaeologistNaturalist]: archaeologistNaturalistBack,
    [AdventurerBack.ArchaeologistArchaeologist]: archaeologistArchaeologistBack,
    [AdventurerBack.ArchaeologistExplorer]: archaeologistExplorerBack,
    [AdventurerBack.ArchaeologistExpeditionLeader]: archaeologistExpeditionLeaderBack,
    [AdventurerBack.ExplorerNaturalist]: explorerNaturalistBack,
    [AdventurerBack.ExplorerArchaeologist]: explorerArchaeologistBack,
    [AdventurerBack.ExplorerExplorer]: explorerExplorerBack,
    [AdventurerBack.ExplorerExpeditionLeader]: explorerExpeditionLeaderBack,
    [AdventurerBack.ExpeditionLeaderNaturalist]: expeditionLeaderNaturalistBack,
    [AdventurerBack.ExpeditionLeaderArchaeologist]: expeditionLeaderArchaeologistBack,
    [AdventurerBack.ExpeditionLeaderExplorer]: expeditionLeaderExplorerBack,
    [AdventurerBack.ExpeditionLeaderExpeditionLeader]: expeditionLeaderExpeditionLeaderBack
  }
}

export const adventurerCardDescription = new AdventurerCardDescription()
