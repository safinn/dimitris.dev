import * as fs from 'node:fs'
import crypto from 'node:crypto'
import chokidar from 'chokidar'
import express from 'express'
import compression from 'compression'
import morgan from 'morgan'
import helmet from 'helmet'
import { createRequestHandler } from '@remix-run/express'
import { broadcastDevReady, installGlobals } from '@remix-run/node'

const MODE = process.env.NODE_ENV

import * as build from './build/index.js'

const BUILD_PATH = './build/index.js'

installGlobals()

const app = express()

const getHost = (req) => req.get('X-Forwarded-Host') ?? req.get('host') ?? ''

// ensure HTTPS only (X-Forwarded-Proto comes from Fly)
app.use((req, res, next) => {
  const proto = req.get('X-Forwarded-Proto')
  const host = getHost(req)
  if (proto === 'http') {
    res.set('X-Forwarded-Proto', 'https')
    res.redirect(`https://${host}${req.originalUrl}`)
    return
  }
  next()
})

// no ending slashes for SEO reasons
app.use((req, res, next) => {
  if (req.path.endsWith('/') && req.path.length > 1) {
    const query = req.url.slice(req.path.length)
    const safepath = req.path.slice(0, -1).replace(/\/+/g, '/')
    res.redirect(301, safepath + query)
  } else {
    next()
  }
})

app.use(compression())

// Remix fingerprints its assets so we can cache forever.
app.use(
  '/build',
  express.static('public/build', {
    immutable: true,
    maxAge: '1y',
    setHeaders(res, resourcePath) {
      const relativePath = resourcePath.replace(`/app/public/build/`, '')

      if (relativePath.startsWith('info.json')) {
        res.setHeader('cache-control', 'no-cache')
        return
      }
    },
  })
)

// Everything else (like favicon.ico) is cached for 1 year.
app.use(express.static('public', { immutable: true, maxAge: '1y' }))

app.use(morgan('tiny'))

app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('hex')
  next()
})

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        connectSrc: MODE === 'development' ? ['ws:', "'self'"] : null,
        scriptSrc: [
          "'self'",
          "'unsafe-eval'",
          (req, res) => `'nonce-${res.locals.cspNonce}'`,
        ],
      },
    },
  })
)

app.all(
  '*',
  process.env.NODE_ENV === 'development'
    ? createDevRequestHandler()
    : createRequestHandler({
        build,
        mode: process.env.NODE_ENV,
        getLoadContext,
      })
)

const port = process.env.PORT || 3000
app.listen(port, async () => {
  console.log(`Express server listening on port ${port}`)

  if (process.env.NODE_ENV === 'development') {
    broadcastDevReady(build)
  }
})

function createDevRequestHandler() {
  // initial build
  /**
   * @type { import('@remix-run/node').ServerBuild | Promise<import('@remix-run/node').ServerBuild> }
   */
  let devBuild = build

  const watcher = chokidar.watch(BUILD_PATH, { ignoreInitial: true })

  watcher.on('all', async () => {
    // 1. purge require cache && load updated server build
    const stat = fs.statSync(BUILD_PATH)
    devBuild = import(BUILD_PATH + '?t=' + stat.mtimeMs)
    // 2. tell dev server that this app server is now ready
    broadcastDevReady(await devBuild)
  })

  return async (req, res, next) => {
    try {
      //
      return createRequestHandler({
        build: await devBuild,
        mode: 'development',
        getLoadContext,
      })(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

function getLoadContext(req, res) {
  return { cspNonce: res.locals.cspNonce }
}
