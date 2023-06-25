import { Link, NavLink } from '@remix-run/react'
import ToggleTheme from './ToggleTheme'
import clsx from 'clsx'
import Icon, { Icons } from './Icon'

export default function Header() {
  return (
    <header className="py-8 px-6">
      <div className="max-w-screen-sm mx-auto flex items-center justify-between ">
        <div className="dark:text-zinc-50 text-zinc-900 text-2xl">
          <Link to="/">
            <svg viewBox="0 0 24 24" width="1em" height="1em">
              <rect
                x="0"
                y="0"
                width="24"
                height="24"
                fill="none"
                stroke="none"
              />
              <path
                d="M20 15.4961C20 19.7938 16.9692 23 12.1057 23C7.10132 23 4 19.862 4 15.4961C4 12.6651 5.40969 10.6527 6.92511 9.59535C7.91189 8.87907 9.88546 8.02636 12 8.02636H12.1057L5.62115 3.14884V1H17.3216V2.87597H8.37004L16.511 8.98139C19.1189 10.9256 20 12.938 20 15.4961ZM18.0617 15.5302C18.0617 13.7907 16.9692 9.83411 12.0352 9.83411C8.22907 9.83411 5.93833 12.5287 5.93833 15.5302C5.93833 18.1566 7.94714 21.124 12.0705 21.124C15.5595 21.124 18.0617 18.7705 18.0617 15.5302Z"
                fill="currentColor"
                stroke="currentColor"
              />
            </svg>
          </Link>
        </div>
        <nav className="flex space-x-[1.2em] items-center">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/posts">Blog</NavItem>
          <NavItem
            to="https://twitter.com/safinn"
            target="_blank"
            ariaLabel="Link to Twitter"
          >
            <Icon id={Icons.Twitter} width="1.2em" height="1.2em" />
          </NavItem>
          <NavItem
            to="https://github.com/safinn"
            target="_blank"
            ariaLabel="Link to GitHub"
          >
            <Icon id={Icons.GitHub} width="1.2em" height="1.2em" />
          </NavItem>
          <ToggleTheme />
        </nav>
      </div>
    </header>
  )
}

function NavItem({
  children,
  to,
  disabled = false,
  ariaLabel,
  ...rest
}: {
  children: string | JSX.Element
  to: string
  disabled?: boolean
  target?: string
  ariaLabel?: string
}) {
  return disabled ? (
    <div
      className={clsx(
        'text-zinc-900 dark:text-zinc-100 opacity-60',
        disabled ? 'line-through cursor-not-allowed' : ''
      )}
    >
      {children}
    </div>
  ) : (
    <NavLink
      to={to}
      className={({ isActive, isPending }) =>
        clsx(
          'text-zinc-900 dark:text-zinc-100 hover:opacity-100 transition-opacity',
          isPending || isActive ? 'opacity-100' : 'opacity-60'
        )
      }
      aria-label={ariaLabel}
      {...rest}
    >
      {children}
    </NavLink>
  )
}
