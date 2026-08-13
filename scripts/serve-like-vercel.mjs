#!/usr/bin/env node
/**
 * A local server that follows this repo's vercel.json.
 *
 * halcyon.uno is a static site with a single index.html, and since the
 * portfolio moved in at /theworks it is also hosting a second, separate single
 * page application with its own router. That makes route order load-bearing:
 * real files first, then each demo's own index.html, then the portfolio shell
 * for its client-side routes, then the marketing page for everything else. Get
 * the order wrong and the failure is silent, because every wrong answer is a
 * valid HTML page. `npx serve` cannot reproduce any of it.
 *
 *   node scripts/serve-like-vercel.mjs [port]
 */
import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const port = Number(process.argv[2] ?? 3900)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
}

/** The `filesystem` handler, including cleanUrls and directory indexes. */
function fromDisk(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0]))
  if (clean.includes('..')) return null

  const candidates = [
    join(root, clean),
    join(root, `${clean}.html`), // cleanUrls
    join(root, clean, 'index.html'),
  ]
  for (const f of candidates) {
    if (existsSync(f) && statSync(f).isFile()) return f
  }
  return null
}

createServer((req, res) => {
  const path = (req.url ?? '/').split('?')[0]

  /* Injected by the platform and absent locally. Falling back to index.html
     hands the browser HTML where it asked for JavaScript, and the resulting
     "Unexpected token '<'" looks like a bug in the site rather than a file that
     was never there. Refuse it, the way production does. */
  if (path.startsWith('/_vercel/')) {
    res.writeHead(404, { 'content-type': 'text/plain' })
    res.end('Not found')
    return
  }

  let file = fromDisk(path)

  if (!file) {
    if (/^\/theworks\/demos\/[^/]+\/?$/.test(path)) {
      file = join(root, path.replace(/\/$/, ''), 'index.html')
    } else if (path === '/theworks' || path.startsWith('/theworks/')) {
      file = join(root, 'theworks', 'index.html')
    } else {
      file = join(root, 'index.html')
    }
  }

  if (!existsSync(file)) {
    res.writeHead(404, { 'content-type': 'text/plain' })
    res.end('Not found')
    return
  }

  res.writeHead(200, {
    'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
    'cache-control': 'no-store',
  })
  createReadStream(file).pipe(res)
}).listen(port, () => console.log(`halcyon.uno on http://localhost:${port}`))
