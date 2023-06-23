import { NavLink } from '@remix-run/react'
import ToggleTheme from './ToggleTheme'
import clsx from 'clsx'
import Icon, { Icons } from './Icon'

export default function Header() {
  return (
    <header className="py-8 px-6">
      <div className="max-w-screen-sm mx-auto flex items-center justify-between ">
        <div className="dark:text-zinc-50 text-zinc-900 text-4xl font-bold">
          δ
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
