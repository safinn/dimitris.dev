import { json } from '@remix-run/node'
import { cache } from '~/services/cache.server'
import {
  isRefreshShaInfo,
  commitShaKey as refreshCacheCommitShaKey,
  type RefreshShaInfo,
} from './action.refresh-cache'

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
  } catch (error: unknown) {
    console.error(`Error parsing commit sha from cache: ${error}`)
    cache.delete(refreshCacheCommitShaKey)
    return json(null)
  }

  return json(value)
}
