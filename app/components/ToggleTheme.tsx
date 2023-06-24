import { MouseEvent } from 'react'
import { flushSync } from 'react-dom'
import { Theme, Themed, useTheme } from '~/utils/theme-provider'
import Icon, { Icons } from './Icon'

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
      <Themed
        dark={<Icon id={Icons.Moon} width="1.2em" height="1.2em" />}
        light={<Icon id={Icons.Sun} width="1.2em" height="1.2em" />}
      />
    </button>
  )
}
