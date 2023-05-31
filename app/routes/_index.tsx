import type { V2_MetaFunction } from '@remix-run/node'
import Toggletheme from '~/components/ToggleTheme'

export const meta: V2_MetaFunction = () => {
  return [
    { title: 'Dimitris Karittevlis' },
    { name: 'description', content: "Dimitris Karittevlis' Portfolio" },
  ]
}

export default function Index() {
  return (
    <div className="leading-relaxed">
      <h1>Index page</h1>
      <Toggletheme />
    </div>
  )
}
