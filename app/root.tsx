import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'
import clsx from 'clsx'
import Footer from './components/Footer'
import Header from './components/Header'
import spritesHref from './sprite.svg'
import './styles/tailwind.css'

import { useNonce } from './utils/nonce-provider'
import { getThemeSession } from './utils/theme.server'
import type { Theme } from '~/utils/theme-provider'
import {
  NonFlashOfWrongThemeEls,
  ThemeBody,
  ThemeProvider,
  useTheme,
} from '~/utils/theme-provider'

export const links: LinksFunction = () => [
  {
    rel: 'preload',
    href: spritesHref,
    as: 'image',
    type: 'image/svg+xml',
  },
]

export type LoaderData = {
  theme: Theme | null
}

export async function loader({ request }: LoaderFunctionArgs) {
  const themeSession = await getThemeSession(request)

  const data: LoaderData = {
    theme: themeSession.getTheme(),
  }

  return data
}

function App() {
  const data = useLoaderData<typeof loader>()
  const [theme] = useTheme()
  const nonce = useNonce()

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="author" content="Dimitris Karittevlis" />
        <link rel="icon" href="/favicon.ico?v=3" />
        <link
          rel="preload"
          href="/Inter-roman.var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/Inter-italic.var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <Meta />
        <Links />
        <NonFlashOfWrongThemeEls nonce={nonce} ssrTheme={Boolean(data.theme)} />
      </head>
      <body className="bg-zinc-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-400 selection:bg-[#8884]">
        <Header />
        <main className="py-8 px-6">
          <Outlet />
        </main>
        <ThemeBody nonce={nonce} ssrTheme={Boolean(data.theme)} />
        <Footer />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
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
