import type { LinksFunction, LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { V2_MetaFunction, useLoaderData } from '@remix-run/react'
import { getMdxPage } from '~/services/mdx.server'
import { useMdxComponent } from '~/utils/mdx'
import styles from '~/styles/prose.css'

export const meta: V2_MetaFunction = ({ data }) => {
  return [
    { title: data.page.frontmatter.title },
    { name: 'description', content: data.page.frontmatter.description },
  ]
}

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }]

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
  const { code, dateDisplay, frontmatter, readTime } = data.page
  const Component = useMdxComponent(code)

  return (
    <>
      <header className="max-w-screen-sm mx-auto mb-20">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-200">
          {frontmatter.title}
        </h1>
        <div className="mt-2">
          {dateDisplay}
          {readTime ? ` · ${readTime.text}` : ''}
        </div>
      </header>
      <article className="max-w-screen-sm mx-auto prose">
        <Component />
      </article>
    </>
  )
}
