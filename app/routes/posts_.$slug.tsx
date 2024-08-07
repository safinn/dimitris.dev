import process from 'node:process'
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@remix-run/node'
import { json } from '@remix-run/node'
import type { MetaFunction } from '@remix-run/react'
import { useFetcher, useLoaderData, useLocation } from '@remix-run/react'
import { useCallback, useEffect, useRef } from 'react'
import { addView } from '~/services/db.server'
import { getMdxPage } from '~/services/mdx.server'
import '~/styles/prose.css'
import { getClientSession } from '~/utils/client.server'
import { useMdxComponent } from '~/utils/mdx'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const ogTitle
    = data?.page.frontmatter.socialImageTitle || data?.page.frontmatter.title

  return [
    { title: data?.page.frontmatter.title },
    { name: 'description', content: data?.page.frontmatter.description },
    {
      property: 'og:title',
      content: ogTitle,
    },
    {
      property: 'og:image',
      content: data?.ogImageUrl,
    },
  ]
}

export async function action({ params, request }: ActionFunctionArgs) {
  if (!params.slug) {
    throw new Error('params.slug is not defined')
  }

  const formData = await request.formData()
  const intent = formData.get('intent')

  switch (intent) {
    case 'mark-as-view': {
      const { slug } = params
      const { clientId, headers } = await getClientSession(request)

      addView(clientId, `/posts/${slug}`)

      return json({ success: true }, { headers })
    }
    default: {
      throw new Error(`Unknown intent: ${intent}`)
    }
  }
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  if (!params.slug) {
    throw new Error('params.slug is not defined')
  }

  const page = await getMdxPage({ contentDir: 'posts', slug: params.slug })

  if (!page) {
    return new Response('Not found', { status: 404 })
  }

  const ogImageTitle = encodeURIComponent(
    page.frontmatter.socialImageTitle || page.frontmatter.title || 'No Title!',
  )
  const url = new URL(request.url)
  if (process.env.NODE_ENV === 'production')
    url.protocol = 'https'
  const ogImageUrl = `${url.origin}/action/og?title=${ogImageTitle}`
  return json({ page, ogImageUrl })
}

function useOnView({
  time,
  onView,
}: {
  time: number | undefined
  onView: () => void
}) {
  useEffect(() => {
    onView()
  }, [time, onView])
}

export default function Post() {
  const data = useLoaderData<typeof loader>()
  const { code, dateDisplay, frontmatter, readTime, views } = data.page
  const Component = useMdxComponent(code)
  const location = useLocation()

  // scroll to selected hash link on refresh
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash)
      if (el) {
        el.scrollIntoView()
      }
    }
  }, [location])

  const markAsRead = useFetcher()
  const markAsReadRef = useRef(markAsRead)
  useEffect(() => {
    markAsReadRef.current = markAsRead
  }, [markAsRead])

  const isDraft = Boolean(data.page.frontmatter.draft)

  useOnView({
    time: data.page.readTime?.time,
    onView: useCallback(() => {
      if (isDraft)
        return
      markAsReadRef.current.submit(
        { intent: 'mark-as-view' },
        { method: 'POST' },
      )
    }, [isDraft]),
  })

  return (
    <>
      <header className="max-w-screen-sm mx-auto mb-20">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-200">
          {frontmatter.title}
        </h1>
        <div className="mt-2">
          {dateDisplay}
          {readTime ? ` · ${readTime.text}` : ''}
          {` · ${views} ${views === 1 ? 'view' : 'views'}`}
        </div>
      </header>
      <article className="max-w-screen-sm mx-auto prose">
        <Component />
      </article>
    </>
  )
}
