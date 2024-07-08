import Buffer from 'node:buffer'
import path from 'node:path'
import process from 'node:process'
import { Octokit as createOctokit } from '@octokit/rest'
import { throttling } from '@octokit/plugin-throttling'
import invariant from 'tiny-invariant'
import { logger } from './log.server'

const ref = process.env.GITHUB_REF ?? 'main'

const Octokit = createOctokit.plugin(throttling)

const octokit = new Octokit({
  throttle: {
    onRateLimit: (retryAfter, options) => {
      const method = 'method' in options ? options.method : 'METHOD_UNKNOWN'
      const url = 'url' in options ? options.url : 'URL_UNKNOWN'
      logger.warn(
        `Request quota exhausted for request ${method} ${url}. Retrying after ${retryAfter} seconds.`,
      )

      return true
    },
    onSecondaryRateLimit: (retryAfter, options) => {
      const method = 'method' in options ? options.method : 'METHOD_UNKNOWN'
      const url = 'url' in options ? options.url : 'URL_UNKNOWN'
      logger.warn(`SecondaryRateLimit detected for request ${method} ${url}`)
    },
  },
})

export type GitHubFile = {
  path: string
  content: string
}

async function downloadDirectory(dir: string): Promise<Array<GitHubFile>> {
  const dirList = await downloadDirList(dir)

  const result = await Promise.all(
    dirList.map(async ({ path: fileDir, type, sha }) => {
      switch (type) {
        case 'file': {
          const content = await downloadFileBySha(sha)
          return { path: fileDir, content }
        }
        case 'dir': {
          return downloadDirectory(fileDir)
        }
        default: {
          throw new Error(`Unexpected repo file type: ${type}`)
        }
      }
    }),
  )

  return result.flat()
}

async function downloadFileBySha(sha: string) {
  const { GITHUB_OWNER, GITHUB_REPO } = process.env
  invariant(GITHUB_OWNER, 'GITHUB_OWNER must be set')
  invariant(GITHUB_REPO, 'GITHUB_REPO must be set')

  const { data } = await octokit.git.getBlob({
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    file_sha: sha,
  })
  //                                lol
  const encoding = data.encoding as Parameters<typeof Buffer.Buffer.from>['1']
  return Buffer.Buffer.from(data.content, encoding).toString()
}

async function downloadFirstMdxFile(
  list: Array<{ name: string, type: string, path: string, sha: string }>,
) {
  const filesOnly = list.filter(({ type }) => type === 'file')
  for (const extension of ['.mdx', '.md']) {
    const file = filesOnly.find(({ name }) => name.endsWith(extension))
    if (file)
      return downloadFileBySha(file.sha)
  }
  return null
}

export async function downloadMdxFileOrDirectory(
  relativeMdxFileOrDirectory: string,
): Promise<{ entry: string, files: Array<GitHubFile> }> {
  const mdxFileOrDirectory = `content/${relativeMdxFileOrDirectory}`

  const parentDir = path.dirname(mdxFileOrDirectory)
  const dirList = await downloadDirList(parentDir)

  const basename = path.basename(mdxFileOrDirectory)
  const mdxFileWithoutExt = path.parse(mdxFileOrDirectory).name
  const potentials = dirList.filter(({ name }) => name.startsWith(basename))
  const exactMatch = potentials.find(
    ({ name }) => path.parse(name).name === mdxFileWithoutExt,
  )
  const dirPotential = potentials.find(({ type }) => type === 'dir')

  const content = await downloadFirstMdxFile(
    exactMatch ? [exactMatch] : potentials,
  )
  let files: Array<GitHubFile> = []
  let entry = mdxFileOrDirectory
  if (content) {
    // technically you can get the blog post by adding .mdx at the end... Weird
    // but may as well handle it since that's easy...
    entry = mdxFileOrDirectory.endsWith('.mdx')
      ? mdxFileOrDirectory
      : `${mdxFileOrDirectory}.mdx`
    // /content/about.mdx => entry is about.mdx, but compileMdx needs
    // the entry to be called "/content/index.mdx" so we'll set it to that
    // because this is the entry for this path
    files = [{ path: path.join(mdxFileOrDirectory, 'index.mdx'), content }]
  }
  else if (dirPotential) {
    entry = dirPotential.path
    files = await downloadDirectory(mdxFileOrDirectory)
  }

  return { entry, files }
}

/**
 *
 * @param path the full path to list
 * @returns a promise that resolves to a file ListItem of the files/directories in the given directory (not recursive)
 */
export async function downloadDirList(path: string) {
  const { GITHUB_OWNER, GITHUB_REPO } = process.env
  invariant(GITHUB_OWNER, 'GITHUB_OWNER must be set')
  invariant(GITHUB_REPO, 'GITHUB_REPO must be set')

  const resp = await octokit.repos.getContent({
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    path,
    ref,
  })

  const data = resp.data

  if (!Array.isArray(data)) {
    throw new TypeError(
      `Tried to download content from path ${path}. GitHub did not return an array of files.`,
    )
  }

  return data
}
