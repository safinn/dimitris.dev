import { createCookieSessionStorage } from '@remix-run/node'
import invariant from 'tiny-invariant'
import type { Theme } from './theme-provider'
import { isTheme } from './theme-provider'

const { SESSION_SECRET } = process.env
invariant(SESSION_SECRET, 'SESSION_SECRET must be set')

const themeStorage = createCookieSessionStorage({
  cookie: {
    name: 'theme',
    secure: true,
    secrets: [SESSION_SECRET],
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
  },
})

async function getThemeSession(request: Request) {
  const session = await themeStorage.getSession(request.headers.get('Cookie'))
  return {
    getTheme: () => {
      const themeValue = session.get('theme')
      return isTheme(themeValue) ? themeValue : null
    },
    setTheme: (theme: Theme) => session.set('theme', theme),
    commit: () =>
      themeStorage.commitSession(session, { expires: new Date('2093-06-13') }),
  }
}

export { getThemeSession }
