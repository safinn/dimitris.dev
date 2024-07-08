import type { LoaderFunctionArgs } from '@remix-run/node'
import satori from 'satori'
import type { SatoriOptions } from 'satori'
import { Resvg } from '@resvg/resvg-js'

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const title = url.searchParams.get('title')

  const jsx = (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#09090b',
        fontSize: 32,
        fontWeight: 600,
        color: 'white',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          top: 60,
          left: 60,
          color: '#aaa',
        }}
      >
        <svg viewBox="0 0 24 24" id="logo" width="30">
          <rect x="0" y="0" width="24" height="24" fill="none" stroke="none" />
          <path
            d="M20 15.4961C20 19.7938 16.9692 23 12.1057 23C7.10132 23 4 19.862 4 15.4961C4 12.6651 5.40969 10.6527 6.92511 9.59535C7.91189 8.87907 9.88546 8.02636 12 8.02636H12.1057L5.62115 3.14884V1H17.3216V2.87597H8.37004L16.511 8.98139C19.1189 10.9256 20 12.938 20 15.4961ZM18.0617 15.5302C18.0617 13.7907 16.9692 9.83411 12.0352 9.83411C8.22907 9.83411 5.93833 12.5287 5.93833 15.5302C5.93833 18.1566 7.94714 21.124 12.0705 21.124C15.5595 21.124 18.0617 18.7705 18.0617 15.5302Z"
            fill="currentColor"
            stroke="currentColor"
          />
        </svg>
        <div style={{ marginLeft: 20, fontSize: 26 }}>dimitris.dev</div>
      </div>
      <div style={{ fontSize: 60, margin: 100, textAlign: 'center' }}>
        {title}
      </div>
    </div>
  )

  const svg = await satori(jsx, {
    width: 1200,
    height: 630,
    fonts: await getFont('Inter'),
  })

  const resvg = new Resvg(svg)
  const pngData = resvg.render()
  const pngBuffer = pngData.asPng()

  return new Response(pngBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, immutable, no-transform, max-age=604800',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    },
  })
}

async function getFont(
  font: string,
  weights = [400, 500, 600, 700],
  text = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\!@#$%^&*()_+-=<>?[]{}|;:,.`\'’"–—',
) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${font}:wght@${weights.join(
      ';',
    )}&text=${encodeURIComponent(text)}`,
    {
      headers: {
        // Make sure it returns TTF.
        'User-Agent':
          'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
      },
    },
  ).then(response => response.text())
  const resource = css.matchAll(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/g,
  )
  return Promise.all(
    [...resource]
      .map(match => match[1])
      .map(url => fetch(url).then(response => response.arrayBuffer()))
      .map(async (buffer, i) => ({
        name: font,
        style: 'normal',
        weight: weights[i],
        data: await buffer,
      })),
  ) as Promise<SatoriOptions['fonts']>
}
