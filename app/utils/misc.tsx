import { Link } from '@remix-run/react'
import * as React from 'react'

export const AnchorOrLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(function AnchorOrLink(props, ref) {
  const { href, children, ...rest } = props
  let shouldUserRegularAnchor = true

  if (href?.startsWith('#')) {
    shouldUserRegularAnchor = false
  }

  if (shouldUserRegularAnchor) {
    return (
      <a {...rest} href={href} ref={ref}>
        {children}
      </a>
    )
  } else {
    return (
      <Link to={href ?? ''} {...rest} ref={ref} preventScrollReset={true}>
        {children}
      </Link>
    )
  }
})
