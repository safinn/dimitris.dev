import { json } from '@remix-run/node'
import {
  type RefreshShaInfo,
  isRefreshShaInfo,
  commitShaKey as refreshCacheCommitShaKey,
} from './action.refresh-cache'
import { cache } from '~/services/cache.server'
import { logger } from '~/services/log.server'

export async function loader() {
  const result = await cache.get(refreshCacheCommitShaKey)
  if (!result) {
    return json(null)
  }

  const value: RefreshShaInfo = result.value
  try {
    if (!isRefreshShaInfo(value)) {
      throw new Error(`Invalid value: ${result.value}`)
    }
  }
  catch (error: unknown) {
    logger.error(error, `Error parsing commit sha from cache`)
    cache.delete(refreshCacheCommitShaKey)
    return json(null)
  }

  return json(value)
}
