import type { SVGProps } from 'react'
import spritesHref from '~/sprite.svg'

export enum Icons {
  Logo = 'logo',
  Twitter = 'twitter',
  GitHub = 'github',
  Sun = 'sun',
  Moon = 'moon',
}

export default function Icon({
  id,
  ...props
}: { id: Icons } & SVGProps<SVGSVGElement>) {
  return (
    <svg {...props}>
      <use href={`${spritesHref}#${id}`} />
    </svg>
  )
}
