import path from 'node:path'
import process from 'node:process'
import { type DataFunctionArgs, json, redirect } from '@remix-run/node'
import { ensurePrimary } from 'litefs-js/dist/remix.js'
import invariant from 'tiny-invariant'
import { cache } from '~/services/cache.server'
import { getBlogMdxListItems, getMdxPage } from '~/services/mdx.server'

type Body =
  | { keys: Array<string>, commitSha?: string }
  | { contentPaths: Array<string>, commitSha?: string }

export interface RefreshShaInfo {
  sha: string
  date: string
}

export function isRefreshShaInfo(value: any): value is RefreshShaInfo {
  return (
    typeof value === 'object'
    && value !== null
    && 'sha' in value
    && typeof value.sha === 'string'
    && 'date' in value
    && typeof value.date === 'string'
  )
}

export const commitShaKey = 'meta:last-refresh-commit-sha'

export async function action({ request }: DataFunctionArgs) {
  await ensurePrimary()

  const { REFRESH_CACHE_SECRET } = process.env
  invariant(REFRESH_CACHE_SECRET, 'REFRESH_CACHE_SECRET must be set')
  // Everything in this function is fire and forget, so we don't need to await
  // anything.
  if (request.headers.get('auth') !== REFRESH_CACHE_SECRET) {
    return redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  }

  const body = (await request.json()) as Body

  function setShaInCache() {
    const { commitSha: sha } = body
    if (sha) {
      const value: RefreshShaInfo = { sha, date: new Date().toISOString() }
      cache.set(commitShaKey, {
        value,
        metadata: {
          createdTime: new Date().getTime(),
          swr: Number.MAX_SAFE_INTEGER,
          ttl: Number.MAX_SAFE_INTEGER,
        },
      })
    }
  }

  if ('keys' in body && Array.isArray(body.keys)) {
    for (const key of body.keys) {
      void cache.delete(key)
    }
    setShaInCache()
    return json({
      message: 'Deleting cache keys',
      keys: body.keys,
      commitSha: body.commitSha,
    })
  }
  if ('contentPaths' in body && Array.isArray(body.contentPaths)) {
    const refreshingContentPaths = []
    for (const contentPath of body.contentPaths) {
      if (typeof contentPath !== 'string') {
        continue
      }

      if (contentPath.startsWith('posts')) {
        const [contentDir, dirOrFilename] = contentPath.split('/')
        if (!contentDir || !dirOrFilename) {
          continue
        }
        const slug = path.parse(dirOrFilename).name

        refreshingContentPaths.push(contentPath)
        void getMdxPage({ contentDir, slug }, { forceFresh: true })
      }
    }

    // if any posts contentPaths were changed then let's update the dir list
    // so it will appear on the blog page.
    if (refreshingContentPaths.some(p => p.startsWith('posts'))) {
      void getBlogMdxListItems({
        forceFresh: true,
      })
    }

    setShaInCache()
    return json({
      message: 'Refreshing cache for content paths',
      contentPaths: refreshingContentPaths,
      commitSha: body.commitSha,
    })
  }
  return json({ message: 'no action taken' }, { status: 400 })
}

export const loader = () => redirect('/', { status: 404 })
