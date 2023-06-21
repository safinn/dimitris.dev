import { MouseEvent } from 'react'
import { flushSync } from 'react-dom'
import { Theme, useTheme } from '~/utils/theme-provider'

export default function ToggleTheme() {
  const [theme, setTheme] = useTheme()

  const toggleTheme = (event: MouseEvent<HTMLButtonElement>) => {
    const isAppearanceTransition =
      // @ts-expect-error experimental API
      document.startViewTransition &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!isAppearanceTransition) {
      setTheme((prevTheme) =>
        prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT
      )
      return
    }

    const x = event.clientX
    const y = event.clientY
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    )

    // @ts-expect-error experimental API
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme((prevTheme) =>
          prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT
        )
      })
    })

    transition.ready.then(() => {
      // const clipPath = [
      //   `circle(0px at ${x}px ${y}px)`,
      //   `circle(${endRadius}px at ${x}px ${y}px)`,
      // ]
      const clipPath = [`inset(0 100% 0 0)`, `inset(0)`]
      document.documentElement.animate(
        {
          clipPath: theme === Theme.DARK ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 300,
          easing: 'ease-out',
          pseudoElement:
            theme === Theme.DARK
              ? '::view-transition-old(root)'
              : '::view-transition-new(root)',
        }
      )
    })
  }

  return (
    <button
      className="text-zinc-900 dark:text-zinc-100 opacity-60 hover:opacity-100 transition-opacity"
      aria-label="Theme mode toggle"
      onClick={toggleTheme}
    >
      {theme === Theme.LIGHT ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1.2em"
          height="1.2em"
          viewBox="0 0 24 24"
        >
          <rect x="0" y="0" width="24" height="24" fill="none" stroke="none" />
          <path
            fill="currentColor"
            d="M12 18a6 6 0 1 1 0-12a6 6 0 0 1 0 12Zm0-2a4 4 0 1 0 0-8a4 4 0 0 0 0 8ZM11 1h2v3h-2V1Zm0 19h2v3h-2v-3ZM3.515 4.929l1.414-1.414L7.05 5.636L5.636 7.05L3.515 4.93ZM16.95 18.364l1.414-1.414l2.121 2.121l-1.414 1.414l-2.121-2.121Zm2.121-14.85l1.414 1.415l-2.121 2.121l-1.414-1.414l2.121-2.121ZM5.636 16.95l1.414 1.414l-2.121 2.121l-1.414-1.414l2.121-2.121ZM23 11v2h-3v-2h3ZM4 11v2H1v-2h3Z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1.2em"
          height="1.2em"
          viewBox="0 0 24 24"
        >
          <rect x="0" y="0" width="24" height="24" fill="none" stroke="none" />
          <path
            fill="currentColor"
            d="M10 7a7 7 0 0 0 12 4.9v.1c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2h.1A6.98 6.98 0 0 0 10 7Zm-6 5a8 8 0 0 0 15.062 3.762A9 9 0 0 1 8.238 4.938A7.999 7.999 0 0 0 4 12Z"
          />
        </svg>
      )}
    </button>
  )
}
