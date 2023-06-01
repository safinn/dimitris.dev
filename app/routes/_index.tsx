import type { V2_MetaFunction } from '@remix-run/node'

export const meta: V2_MetaFunction = () => {
  return [
    { title: 'Dimitris Karittevlis' },
    { name: 'description', content: "Dimitris Karittevlis' Portfolio" },
  ]
}

export default function Index() {
  return (
    <div className="max-w-screen-sm mx-auto">
      <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        Dimitris
      </h1>
      <p>
        Software Engineer at{' '}
        <a
          className="text-zinc-900 dark:text-zinc-100"
          href="https://riskledger.com"
        >
          Risk Ledger
        </a>
      </p>
      <p>
        Previously{' '}
        <a className="text-zinc-900 dark:text-zinc-100" href="https://sky.com">
          Sky
        </a>{' '}
        and{' '}
        <a
          className="text-zinc-900 dark:text-zinc-100"
          href="https://rolls-roycemotorcars.com"
        >
          Rolls-Royce Motor Cars
        </a>
      </p>
    </div>
  )
}
