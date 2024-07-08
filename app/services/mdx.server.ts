import { cachified } from '@epic-web/cachified'
import * as dateFns from 'date-fns'
import type calculateReadingTime from 'reading-time'
import { cache } from './cache.server'
import { compileMdx } from './compile-mdx.server'
import { getAllViewsBySlug, getViewsForSlug } from './db.server'
import type { GitHubFile } from './github.server'
import { downloadDirList, downloadMdxFileOrDirectory } from './github.server'
import { logger } from './log.server'

const defaultTTL = 1000 * 60 * 60 * 24 * 14 // 14 days
const defaultStaleWhileRevalidate = 1000 * 60 * 60 * 24 * 30 // 30 days

type OptionalCachifiedOptions = {
  forceFresh?: boolean
  ttl?: number
}

export async function downloadMdxFilesCached(
  contentDir: string,
  slug: string,
  options?: OptionalCachifiedOptions
) {
  const { forceFresh, ttl = defaultTTL } = options || {}
  const key = `${contentDir}:${slug}:downloaded`
  const downloaded = await cachified({
    cache,
    ttl,
    staleWhileRevalidate: defaultStaleWhileRevalidate,
    forceFresh,
    key,
    checkValue: (value: unknown) => {
      if (typeof value !== 'object') {
        return `value is not an object`
      }
      if (value === null) {
        return `value is null`
      }

      const download = value as Record<string, unknown>
      if (!Array.isArray(download.files)) {
        return `value.files is not an array`
      }
      if (typeof download.entry !== 'string') {
        return `value.entry is not a string`
      }

      return true
    },
    getFreshValue: async () =>
      downloadMdxFileOrDirectory(`${contentDir}/${slug}`),
  })
  // if there aren't any files, remove it from the cache
  if (!downloaded.files.length) {
    void cache.delete(key)
  }
  return downloaded
}

function typedBoolean<T>(
  value: T
): value is Exclude<T, '' | 0 | false | null | undefined> {
  return Boolean(value)
}

const checkCompiledValue = (value: unknown) =>
  typeof value === 'object' &&
  (value === null || ('code' in value && 'frontmatter' in value))

async function getMdxPagesInDirectory(
  contentDir: string,
  options?: OptionalCachifiedOptions
) {
  const dirList = await getMdxDirList(contentDir, options)

  const pageDatas = await Promise.all(
    dirList.map(async ({ slug }) => {
      return {
        ...(await downloadMdxFilesCached(contentDir, slug, options)),
        slug,
      }
    })
  )

  const pages = await Promise.all(
    pageDatas.map((pageData) =>
      compileMdxCached({ contentDir, ...pageData, options })
    )
  )
  return pages.filter(typedBoolean)
}

const getDirListKey = (contentDir: string) => `${contentDir}:dir-list`

export async function getMdxDirList(
  contentDir: string,
  options?: OptionalCachifiedOptions
) {
  const { forceFresh, ttl = defaultTTL } = options ?? {}
  const key = getDirListKey(contentDir)

  return cachified({
    key,
    cache,
    ttl,
    staleWhileRevalidate: defaultStaleWhileRevalidate,
    forceFresh,
    checkValue: (value) => Array.isArray(value),
    getFreshValue: async () => {
      const fullContentDirPath = `content/${contentDir}`
      const dirList = (await downloadDirList(fullContentDirPath))
        .map(({ name, path }) => ({
          name,
          slug: path
            .replace(`${fullContentDirPath}/`, '')
            .replace(/\.mdx$/, ''),
        }))
        .filter(({ name }) => name !== 'README.md')
      return dirList
    },
  })
}
type Keywords = {
  keywords?: Array<string>
}

type MdxPage = {
  code: string
  slug: string
  readTime?: ReturnType<typeof calculateReadingTime>
  dateDisplay?: string

  /**
   * It's annoying that all these are set to optional I know, but there's
   * no great way to ensure that the MDX files have these properties,
   * especially when a common use case will be to edit them without running
   * the app or build. So we're going to force you to handle situations when
   * these values are missing to avoid runtime errors.
   */
  frontmatter: {
    archived?: boolean
    draft?: boolean
    unlisted?: boolean
    title?: string
    description?: string
    meta?: Keywords & {
      [key: string]: string
    }

    // Post meta
    categories?: Array<string>
    date?: string
    socialImageTitle?: string
    socialImagePreTitle?: string
    translations?: Array<{
      language: string
      link: string
      author?: {
        name: string
        link?: string
      }
    }>
  }
}

export type MdxListItem = Omit<MdxPage, 'code'>

function mapFromMdxPageToMdxListItem(page: MdxPage): MdxListItem {
  const { code, ...mdxListItem } = page
  return mdxListItem
}

export type MdxListItemViews = MdxListItem & { views: number }

export async function getBlogMdxListItems(options?: OptionalCachifiedOptions) {
  const { forceFresh = false, ttl = defaultTTL } = options || {}
  const key = 'posts:mdx-list-items'

  const allViews = getAllViewsBySlug()

  const blogMdxListItems = await cachified({
    key,
    cache,
    forceFresh,
    ttl,
    staleWhileRevalidate: defaultStaleWhileRevalidate,
    async getFreshValue() {
      let pages = await getMdxPagesInDirectory('posts', options).then(
        (allPosts) =>
          allPosts.filter((p) => {
            if (process.env.NODE_ENV === 'development') return true
            return !p.frontmatter.draft && !p.frontmatter.unlisted
          })
      )

      pages = pages.sort((a, z) => {
        const aTime = new Date(a.frontmatter.date ?? '').getTime()
        const zTime = new Date(z.frontmatter.date ?? '').getTime()
        return aTime > zTime ? -1 : aTime === zTime ? 0 : 1
      })

      return pages.map(mapFromMdxPageToMdxListItem)
    },
  })

  const allViewsBySlug = allViews.reduce(
    (obj: { [key: string]: number }, view) => {
      obj[view.slug] = view.views
      return obj
    },
    {}
  )

  return blogMdxListItems.map((item) => {
    return {
      ...item,
      views: allViewsBySlug[`/posts/${item.slug}`] || 0,
    }
  })
}

function formatDate(dateString: string | Date, format = 'PPP') {
  if (typeof dateString !== 'string') {
    dateString = dateString.toISOString()
  }
  return dateFns.format(parseDate(dateString), format)
}

function parseDate(dateString: string) {
  return dateFns.add(dateFns.parseISO(dateString), {
    minutes: new Date().getTimezoneOffset(),
  })
}

async function compileMdxCached({
  contentDir,
  slug,
  files,
  options = {},
}: {
  contentDir: string
  slug: string
  entry: string
  files: Array<GitHubFile>
  options?: OptionalCachifiedOptions
}) {
  const key = `${contentDir}:${slug}:compiled`
  const page = await cachified({
    cache,
    ttl: defaultTTL,
    staleWhileRevalidate: defaultStaleWhileRevalidate,
    ...options,
    key,
    checkValue: checkCompiledValue,
    getFreshValue: async () => {
      const compiledPage = await compileMdx<MdxPage['frontmatter']>(slug, files)
      if (compiledPage) {
        return {
          dateDisplay: compiledPage.frontmatter.date
            ? formatDate(compiledPage.frontmatter.date)
            : undefined,
          ...compiledPage,
          slug,
        }
      } else {
        return null
      }
    },
  })
  // if there's no page, remove it from the cache
  if (!page) {
    void cache.delete(key)
  }
  return page
}

export type MdxPageViews = MdxPage & { views: number }

export async function getMdxPage(
  {
    contentDir,
    slug,
  }: {
    contentDir: string
    slug: string
  },
  options?: OptionalCachifiedOptions
): Promise<MdxPageViews | null> {
  const { forceFresh, ttl = defaultTTL } = options || {}
  const key = `mdx-page:${contentDir}:${slug}:compiled`
  const page = await cachified({
    key,
    cache,
    ttl,
    staleWhileRevalidate: defaultStaleWhileRevalidate,
    forceFresh,
    checkValue: checkCompiledValue,
    getFreshValue: async () => {
      const pageFiles = await downloadMdxFilesCached(contentDir, slug, options)
      const compiledPage = await compileMdxCached({
        contentDir,
        slug,
        ...pageFiles,
        options,
      }).catch((err) => {
        logger.error(`Failed to get a fresh value for mdx:`, {
          contentDir,
          slug,
        })
        return Promise.reject(err)
      })
      return compiledPage
    },
  })
  if (!page) {
    // if there's no page, let's remove it from the cache
    void cache.delete(key)
    return page
  } else {
    const viewsForSlug = getViewsForSlug(`/${contentDir}/${slug}`) || 0
    return { ...page, views: viewsForSlug.views }
  }
}
