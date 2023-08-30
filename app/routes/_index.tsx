import { LoaderArgs } from '@remix-run/node'
import type { MetaFunction } from '@remix-run/react'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: 'Dimitris Karittevlis' },
    { name: 'description', content: "Dimitris Karittevlis' Portfolio" },
    {
      property: 'og:image',
      content: data?.ogImageUrl,
    },
  ]
}

export const loader = async ({ request }: LoaderArgs) => {
  const ogImageTitle = encodeURIComponent("Hey I'm Dimitris, a Developer!")
  const url = new URL(request.url)
  if (process.env.NODE_ENV === 'production') url.protocol = 'https'
  const ogImageUrl = `${url.origin}/action/og?title=${ogImageTitle}`
  return { ogImageUrl }
}

export default function Index() {
  return (
    <div className="max-w-screen-sm mx-auto">
      <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        Dimitris
      </h1>
      <p>
        Software Engineer at <A href="https://riskledger.com">Risk Ledger</A>
      </p>
      <p>
        Previously <A href="https://sky.com">Sky</A> and{' '}
        <A href="https://www.rolls-roycemotorcars.com">
          Rolls-Royce Motor Cars
        </A>
      </p>
    </div>
  )
}

function A({ children, href }: { children: string; href: string }) {
  return (
    <a
      className="text-zinc-900 dark:text-zinc-100 border-b border-zinc-900 dark:border-zinc-100 border-opacity-20 dark:border-opacity-20 hover:border-opacity-100 hover:dark:border-opacity-100 transition-colors"
      target="_blank"
      rel="noreferrer"
      href={href}
    >
      {children}
    </a>
  )
}
