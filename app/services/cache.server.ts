import type { CacheEntry } from '@epic-web/cachified'
import Database from 'better-sqlite3'
import { getInstanceInfo, getInstanceInfoSync } from 'litefs-js'
import invariant from 'tiny-invariant'
import { updatePrimaryCacheValue } from '~/routes/action.cache'
import { logger } from './log.server'

export const cacheDb = createDatabase()

function createDatabase() {
  const { CACHE_DATABASE_PATH } = process.env
  invariant(CACHE_DATABASE_PATH, 'CACHE_DATABASE_PATH must be set')

  const db = new Database(CACHE_DATABASE_PATH)

  db.pragma('journal_mode = WAL')

  const { currentIsPrimary } = getInstanceInfoSync()
  if (!currentIsPrimary) return db

  try {
    // create cache table with metadata JSON column and value JSON column if it does not exist already
    db.exec(`
      CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY NOT NULL,
        metadata TEXT,
        value TEXT
      )
    `)

    // create views table
    db.exec(`
      CREATE TABLE IF NOT EXISTS views (
        id TEXT PRIMARY KEY NOT NULL,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        clientId TEXT NOT NULL,
        slug TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS "views_slug_idx" ON "views"("slug");
      CREATE INDEX IF NOT EXISTS "views_clientId_slug_idx" ON "views"("clientId", "slug");
    `)
  } catch (error) {
    logger.error(`failed creating cache db at ${CACHE_DATABASE_PATH}`)
    throw error
  }

  return db
}

export const cache = {
  get(key: string) {
    const result = cacheDb
      .prepare('SELECT value, metadata FROM cache WHERE key = ?')
      .get(key) as any

    if (!result) return null

    return {
      metadata: JSON.parse(result.metadata),
      value: JSON.parse(result.value),
    }
  },
  async set(key: string, entry: CacheEntry) {
    const { currentIsPrimary, primaryInstance } = await getInstanceInfo()

    if (currentIsPrimary) {
      cacheDb
        .prepare(
          'INSERT OR REPLACE INTO cache (key, value, metadata) VALUES (@key, @value, @metadata)'
        )
        .run({
          key,
          value: JSON.stringify(entry.value),
          metadata: JSON.stringify(entry.metadata),
        })
    } else {
      // fire-and-forget cache update
      void updatePrimaryCacheValue({
        key,
        cacheValue: entry,
      }).then((response) => {
        if (!response.ok) {
          logger.error(
            `Error updating cache value for key "${key}" on primary instance (${primaryInstance}): ${response.status} ${response.statusText}`,
            { entry }
          )
        }
      })
    }
  },
  async delete(key: string) {
    const { currentIsPrimary, primaryInstance } = await getInstanceInfo()

    if (currentIsPrimary) {
      cacheDb.prepare('DELETE FROM cache WHERE key = ?').run(key)
    } else {
      // fire-and-forget cache update
      void updatePrimaryCacheValue({
        key,
        cacheValue: undefined,
      }).then((response) => {
        if (!response.ok) {
          logger.error(
            `Error deleting cache value for key "${key}" on primary instance (${primaryInstance}): ${response.status} ${response.statusText}`
          )
        }
      })
    }
  },
}
