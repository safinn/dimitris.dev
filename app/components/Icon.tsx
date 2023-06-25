import { SVGProps } from 'react'

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
      <use href={`/sprite.svg?v=2#${id}`} />
    </svg>
  )
}
