import { Picture } from '@gamepark/react-game'
import { FC } from 'react'
import { helpIcon, helpIcons } from './helpStyles'

/** The icons of a condition or of a gain, on the line of the sentence that reads them out. */
export const GameIcons: FC<{ icons: string[] }> = ({ icons }) => {
  if (!icons.length) return null
  return (
    <span css={helpIcons}>
      {icons.map((icon, index) => (
        <Picture key={index} src={icon} css={helpIcon} />
      ))}
    </span>
  )
}
