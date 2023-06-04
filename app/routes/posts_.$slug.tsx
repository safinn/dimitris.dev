import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { getMdxPage } from '~/services/mdx.server'
import { useMdxComponent } from '~/utils/mdx'

export const loader = async ({ request, params }: LoaderArgs) => {
  if (!params.slug) {
    throw new Error('params.slug is not defined')
  }

  const page = await getMdxPage({ contentDir: 'posts', slug: params.slug })

  if (!page) throw json({}, { status: 404 })

  return { page }
}

export default function Post() {
  const data = useLoaderData<typeof loader>()
  const { code, dateDisplay, frontmatter } = data.page
  const Component = useMdxComponent(code)

  return (
    <article className="max-w-screen-sm mx-auto">
      <Component />
    </article>
  )
}
