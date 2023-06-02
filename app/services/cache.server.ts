import Database from 'better-sqlite3'
import invariant from 'tiny-invariant'
import { logger } from './log.server'
import type { CacheEntry } from 'cachified'

const cacheDb = createDatabase()

function createDatabase() {
  const { CACHE_DATABASE_PATH } = process.env
  invariant(CACHE_DATABASE_PATH, 'CACHE_DATABASE_PATH must be set')

  const db = new Database(CACHE_DATABASE_PATH)

  try {
    // create cache table with metadata JSON column and value JSON column if it does not exist already
    db.exec(`
      CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY,
        metadata TEXT,
        value TEXT
      )
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
  set(key: string, entry: CacheEntry) {
    cacheDb
      .prepare(
        'INSERT OR REPLACE INTO cache (key, value, metadata) VALUES (@key, @value, @metadata)'
      )
      .run({
        key,
        value: JSON.stringify(entry.value),
        metadata: JSON.stringify(entry.metadata),
      })
  },
  delete(key: string) {
    cacheDb.prepare('DELETE FROM cache WHERE key = ?').run(key)
  },
}
