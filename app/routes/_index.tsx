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
      <h1>Index page</h1>
    </div>
  )
}
