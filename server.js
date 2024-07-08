import crypto from 'node:crypto'
import process from 'node:process'
import { createRequestHandler } from '@remix-run/express'
import compression from 'compression'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'

const { NODE_ENV } = process.env
const isDev = NODE_ENV === 'development'
const isProd = NODE_ENV === 'production'

const viteDevServer = isProd
  ? undefined
  : await import('vite').then(vite =>
    vite.createServer({
      server: { middlewareMode: true },
    }),
  )

const remixHandler = createRequestHandler({
  getLoadContext: (_, res) => ({
    cspNonce: res.locals.cspNonce,
  }),
  build: viteDevServer
    ? () => viteDevServer.ssrLoadModule('virtual:remix/server-build')
    : await import('./build/server/index.js'),
})

const app = express()

const getHost = req => req.get('X-Forwarded-Host') ?? req.get('host') ?? ''

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
  }
  else {
    next()
  }
})

app.use(compression())

// handle asset requests
if (viteDevServer) {
  app.use(viteDevServer.middlewares)
}
else {
  // Vite fingerprints its assets so we can cache forever.
  app.use(
    '/assets',
    express.static('build/client/assets', {
      immutable: true,
      maxAge: '1y',
      setHeaders(res, resourcePath) {
        const relativePath = resourcePath.replace(`/app/public/build/`, '')

        if (relativePath.startsWith('info.json')) {
          res.setHeader('cache-control', 'no-cache')
        }
      },
    }),
  )
}

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static('build/client', { maxAge: '24h' }))

app.use(morgan('tiny'))

app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('hex')
  next()
})

app.use(
  helmet({
    xPoweredBy: null,
    contentSecurityPolicy: {
      directives: {
        connectSrc: isDev ? ['ws:', '\'self\''] : null,
        scriptSrc: [
          '\'self\'',
          '\'unsafe-eval\'',
          isDev
            ? '\'sha256-gRR+6gJs/kocf3LfN3EZY9IiGF5Ahm9Zq8V6gmW7Yc8=\''
            : null,
          (req, res) => `'nonce-${res.locals.cspNonce}'`,
        ],
      },
    },
  }),
)

// handle SSR requests
app.all('*', remixHandler)

const port = process.env.PORT || 3000
app.listen(port, async () => {
  console.log(`Express server listening on port ${port}`)
})
