import { json, redirect, type DataFunctionArgs } from '@remix-run/node'
import { getInstanceInfo, getInternalInstanceDomain } from 'litefs-js'
import invariant from 'tiny-invariant'
import { cache } from '~/services/cache.server'

export async function action({ request }: DataFunctionArgs) {
  const { currentIsPrimary, primaryInstance } = await getInstanceInfo()
  if (!currentIsPrimary) {
    throw new Error(
      `${request.url} should only be called on the primary instance (${primaryInstance})}`
    )
  }
  const { INTERNAL_COMMAND_TOKEN } = process.env
  invariant(INTERNAL_COMMAND_TOKEN, 'INTERNAL_COMMAND_TOKEN must be set')

  const isAuthorized =
    request.headers.get('Authorization') === `Bearer ${INTERNAL_COMMAND_TOKEN}`
  if (!isAuthorized) {
    console.log(
      `Unauthorized request to ${request.url}, redirecting to solid tunes 🎶`
    )
    // rick roll them
    return redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  }
  const { key, cacheValue } = await request.json()
  if (cacheValue === undefined) {
    console.log(`Deleting ${key} from the cache from remote`)
    await cache.delete(key)
  } else {
    console.log(`Setting ${key} in the cache from remote`)
    await cache.set(key, cacheValue)
  }
  return json({ success: true })
}

export async function updatePrimaryCacheValue({
  key,
  cacheValue,
}: {
  key: string
  cacheValue: any
}) {
  const { currentIsPrimary, primaryInstance } = await getInstanceInfo()
  if (currentIsPrimary) {
    throw new Error(
      `updatePrimaryCacheValue should not be called on the primary instance (${primaryInstance})}`
    )
  }
  const domain = getInternalInstanceDomain(primaryInstance)
  const { INTERNAL_COMMAND_TOKEN } = process.env
  invariant(INTERNAL_COMMAND_TOKEN, 'INTERNAL_COMMAND_TOKEN must be set')

  return fetch(`${domain}/resources/cache/sqlite`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${INTERNAL_COMMAND_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key, cacheValue }),
  })
}
