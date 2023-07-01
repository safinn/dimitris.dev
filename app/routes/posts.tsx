import type { LoaderArgs } from '@remix-run/node'
import { Link, V2_MetaFunction, useLoaderData } from '@remix-run/react'
import type { MdxListItemViews } from '~/services/mdx.server'
import { getBlogMdxListItems } from '~/services/mdx.server'

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: 'Blog - Dimitris Karittevlis' },
    { name: 'description', content: "Dimitris Karittevlis' blog post list" },
    {
      property: 'og:image',
      content: data?.ogImageUrl,
    },
  ]
}

export const loader = async ({ request }: LoaderArgs) => {
  const posts = await getBlogMdxListItems()

  const emptyLines = [
    'Empty blog post list: the ultimate Zen experience. Embrace the void, my friend.',
    `Congratulations! You've discovered the hidden treasure of the blog: a
  list of empty promises and unfulfilled content. But hey, at least the
  suspense is free!`,
    `This page is like a cosmic joke: plenty of potential blog posts, but not a single punchline in sight.`,
    `Beneath this mask of emptiness, lies the potential for epic tales and profound musings. Stay tuned for future revelations.`,
  ]

  const emptyLine = emptyLines[Math.floor(Math.random() * emptyLines.length)]

  const ogImageTitle = encodeURIComponent('dimitris.dev Post List')
  const url = new URL(request.url)
  if (process.env.NODE_ENV === 'production') url.protocol = 'https'
  const ogImageUrl = `${url.origin}/action/og?title=${ogImageTitle}`

  return { posts, emptyLine, ogImageUrl }
}

export default function Posts() {
  const data = useLoaderData<typeof loader>()

  return (
    <div className="max-w-screen-sm mx-auto">
      {!data.posts.length ? (
        <div>{data.emptyLine}</div>
      ) : (
        <ol>
          {data.posts.map((post) => (
            <PostItem key={post.slug} post={post} />
          ))}
        </ol>
      )}
    </div>
  )
}

function PostItem({ post }: { post: MdxListItemViews }) {
  return (
    <li className="flex space-x-2 items-center">
      {(post.frontmatter.draft || post.frontmatter.unlisted) && (
        <span className="text-xs font-semibold uppercase bg-orange-500 rounded px-1 py-0.5 text-zinc-800">
          {post.frontmatter.draft ? 'Draft' : 'Unlisted'}
        </span>
      )}
      <Link to={post.slug}>
        {post.frontmatter.title} {post.views}{' '}
        {post.views === 1 ? 'view' : 'views'}
      </Link>
    </li>
  )
}
