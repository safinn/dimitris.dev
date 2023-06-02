import { cssBundleHref } from '@remix-run/css-bundle'
import type { LinksFunction, LoaderArgs } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'
import clsx from 'clsx'
import type { Theme } from '~/utils/theme-provider'
import {
  NonFlashOfWrongThemeEls,
  ThemeProvider,
  useTheme,
} from '~/utils/theme-provider'
import styles from './styles/tailwind.css'
import { getThemeSession } from './utils/theme.server'
import Header from './components/Header'
import Footer from './components/Footer'

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
  { rel: 'stylesheet', href: styles },
]

export type LoaderData = {
  theme: Theme | null
}

export const loader = async ({ request }: LoaderArgs) => {
  const themeSession = await getThemeSession(request)

  const data: LoaderData = {
    theme: themeSession.getTheme(),
  }

  return data
}

function App() {
  const data = useLoaderData<LoaderData>()
  const [theme] = useTheme()

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="author" content="Dimitris Karittevlis" />
        <Meta />
        <Links />
        <NonFlashOfWrongThemeEls ssrTheme={Boolean(data.theme)} />
      </head>
      <body className="bg-zinc-200 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-400 selection:bg-[#8884]">
        <Header />
        <main className="py-8 px-6">
          <Outlet />
        </main>
        <Footer />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>()

  return (
    <ThemeProvider specifiedTheme={data.theme}>
      <App />
    </ThemeProvider>
  )
}
