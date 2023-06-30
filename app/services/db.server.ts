import { cacheDb } from './cache.server'
import { v4 as uuidv4 } from 'uuid'

export function addView(clientId: string, slug: string) {
  const readInLastHour = cacheDb
    .prepare(
      "SELECT * FROM views WHERE clientId = ? AND slug = ? AND createdAt >= DATETIME('now', '-1 hour')"
    )
    .get(clientId, slug)

  if (readInLastHour) {
    return
  }

  return cacheDb
    .prepare('INSERT INTO views (id, clientId, slug) VALUES (?, ?, ?)')
    .run(uuidv4(), clientId, slug)
}

export function getAllViewsBySlug() {
  return cacheDb
    .prepare('SELECT slug, COUNT(id) FROM views GROUP BY slug')
    .all()
}
