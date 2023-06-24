import type { LoaderArgs } from '@remix-run/node'
import { Link, V2_MetaFunction, useLoaderData } from '@remix-run/react'
import type { MdxListItem } from '~/services/mdx.server'
import { getBlogMdxListItems } from '~/services/mdx.server'

export const meta: V2_MetaFunction = () => {
  return [
    { title: 'Blog - Dimitris Karittevlis' },
    { name: 'description', content: "Dimitris Karittevlis' blog post list" },
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

  return { posts, emptyLine }
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

function PostItem({ post }: { post: MdxListItem }) {
  return (
    <li className="flex space-x-2 items-center">
      {(post.frontmatter.draft || post.frontmatter.unlisted) && (
        <span className="text-xs font-semibold uppercase bg-orange-500 rounded px-1 py-0.5 text-zinc-800">
          {post.frontmatter.draft ? 'Draft' : 'Unlisted'}
        </span>
      )}
      <Link to={post.slug}>{post.frontmatter.title}</Link>
    </li>
  )
}
