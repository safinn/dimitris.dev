import { createCookieSessionStorage } from '@remix-run/node'
import invariant from 'tiny-invariant'
import { v4 as uuidv4 } from 'uuid'

const { SESSION_SECRET } = process.env
invariant(SESSION_SECRET, 'SESSION_SECRET must be set')

const clientStorage = createCookieSessionStorage({
  cookie: {
    name: 'client_id',
    secure: true,
    secrets: [SESSION_SECRET],
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
  },
})

export async function getClientSession(request: Request) {
  const session = await clientStorage.getSession(request.headers.get('Cookie'))
  let clientId = session.get('clientId') as string | undefined
  let headers: Record<string, string> | undefined = undefined

  // generate client id and create header object if client id does not already exist
  if (!clientId) {
    clientId = uuidv4()
    session.set('clientId', clientId)
    // headers = new Headers()
    // headers.append(
    //   'Set-Cookie',
    //   await clientStorage.commitSession(session, {
    //     expires: new Date('2093-06-13'),
    //   })
    // )
    headers = {
      'Set-Cookie': await clientStorage.commitSession(session, {
        expires: new Date('2093-06-13'),
      }),
    }
  }

  return { clientId, headers }
}
