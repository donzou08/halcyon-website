/* Offline app shell.
 *
 * The problem this solves: inside a steel and concrete warehouse there is no
 * signal, and without a service worker the app does not open at all. A blank
 * browser error is the worst possible thing to hand someone who is standing on
 * a site trying to check in.
 *
 * What this does NOT do: queue writes. A check-in typed with no signal is still
 * lost. That is a larger piece of work, tracked in PRODUCTIZATION.md. This makes
 * the app OPEN, show what it last knew, and say plainly that it cannot reach the
 * server.
 *
 * Strategy, by request kind:
 *   navigations   network first, falling back to the cached shell. Online users
 *                 always get fresh HTML, so a deploy is picked up immediately.
 *   /assets/*     cache first. Vite fingerprints these filenames, so a cached
 *                 one can never be stale, and this is what makes a cold offline
 *                 start work.
 *   other static  stale while revalidate: serve the cache, refresh behind it.
 *   everything    left alone. Supabase, storage and fonts are never cached: a
 *   else          stale visit list read from a cache the app does not know
 *                 about would be worse than an honest failure, and the app has
 *                 its own in-memory cache and "can't reach the server" state.
 */

const VERSION = "v4";

// Where this app actually lives. The worker is served from the app's own
// directory, so its own URL is the answer: "/" for a tenant deployment,
// "/contractors/demo/crew/" when the marketing site embeds the demo under a
// path. Every path below is built from it, because a worker that precaches
// "/index.html" from a page served under a path caches somebody else's page.
const SCOPE = new URL("./", self.location).pathname;

// Caches are per ORIGIN, not per scope, and this origin serves more than one
// Halcyon app. The scope is part of the name, and the sweep on activate only
// touches names carrying this scope, so two apps cannot delete each other.
const SHELL_CACHE = `crew-shell-${VERSION}@${SCOPE}`;
const ASSET_CACHE = `crew-assets-${VERSION}@${SCOPE}`;
const SHELL_URL = `${SCOPE}index.html`;
// Both faces are self-hosted and precached. Without this the first offline
// open falls back to the metric-matched system stack, which is readable but
// is not the app the supervisor was shown.
const FONT_URLS = [
  `${SCOPE}fonts/onest-latin.woff2`,
  `${SCOPE}fonts/geist-mono-latin.woff2`,
];
// The mark, the tab icon and the manifest. The login screen and every header
// draw the mark, so a cold offline open without it is an app with a hole in it
// where its identity goes. The manifest is here because an install prompt on a
// weak signal should not have to wait on the network for a 400 byte file.
// The two 512s are deliberately NOT precached: the installer fetches them once
// and they are not on any screen.
const ICON_URLS = [
  `${SCOPE}logo.svg`,
  `${SCOPE}favicon.svg`,
  `${SCOPE}halcyon-wordmark.svg`,
  `${SCOPE}manifest.webmanifest`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // `reload` bypasses the HTTP cache, so a new deploy never installs the
      // previous build's HTML.
      const shell = await fetch(new Request(SHELL_URL, { cache: "reload" }));
      if (!shell || shell.status !== 200) throw new Error("shell unavailable");
      await cache.put(SHELL_URL, shell.clone());

      const assets = await caches.open(ASSET_CACHE);
      // The bundle has to be precached here, not left to the fetch handler.
      //
      // On a first visit the page asks for its script and stylesheet BEFORE
      // this worker is controlling anything, so none of it passes through the
      // fetch handler and none of it is cached. Open the app once, walk into a
      // warehouse, reopen it: the shell was there and the bundle was not, so
      // the app did not start at all. That is the exact case the offline shell
      // exists for, and the worker's own message promises it works.
      //
      // The filenames are fingerprinted and change every build, so they are
      // read out of the shell that was just fetched rather than written down.
      const wanted = new Set([...FONT_URLS, ...ICON_URLS]);
      const html = await shell.text();
      const refs = /<(?:script[^>]+src|link[^>]+href)=["']([^"']+)["']/gi;
      for (let m; (m = refs.exec(html)); ) {
        const u = new URL(m[1], self.location.href);
        if (u.origin !== self.location.origin) continue;
        if (u.pathname.startsWith(`${SCOPE}assets/`) || u.pathname.startsWith(`${SCOPE}fonts/`)) {
          wanted.add(u.pathname);
        }
      }
      // Never let one missing file stop the shell installing.
      await Promise.all(
        [...wanted].map((u) => assets.add(new Request(u, { cache: "reload" })).catch(() => {})),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL_CACHE, ASSET_CACHE]);
      const names = await caches.keys();
      const stale = names.filter(
        (n) =>
          !keep.has(n) &&
          // this app, this scope, an older version
          (n.endsWith(`@${SCOPE}`) ||
            // and the v1/v2 names, which carried no scope at all
            /^(shell|assets)-v[12]$/.test(n)),
      );
      await Promise.all(stale.map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

/**
 * Every lookup ignores Vary.
 *
 * Vite's preview server, and plenty of CDNs, answer static files with
 * "Vary: Origin". The precache is filled by requests this worker makes itself,
 * which carry no Origin header; the page's own requests for a module script,
 * a stylesheet or a font are CORS requests and do carry one. The two then do
 * not match, so a cold offline start found an empty-looking cache and the app
 * would not open at all, which is the one thing the offline shell exists to
 * prevent. These files are fingerprinted and same-origin: they cannot honestly
 * vary by anything.
 */
const MATCH = { ignoreVary: true };

async function networkFirstShell(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const fresh = await fetch(request);
    // Only a real 200 replaces the shell. A captive portal or a 5xx must not.
    if (fresh && fresh.status === 200) cache.put(SHELL_URL, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(SHELL_URL, MATCH);
    if (cached) return cached;
    return new Response(
      "<!doctype html><meta charset=utf-8><title>Offline</title>" +
        "<body style=\"font-family:system-ui,sans-serif;padding:2rem;text-align:center\">" +
        "<p>No connection, and this device has not loaded the app yet.</p>" +
        "<p>Open it once where you have signal and it will work offline after that.</p>",
      { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, MATCH);
  if (cached) return cached;
  const fresh = await fetch(request);
  if (fresh && fresh.status === 200) cache.put(request, fresh.clone());
  return fresh;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, MATCH);
  const network = fetch(request)
    .then((fresh) => {
      if (fresh && fresh.status === 200) cache.put(request, fresh.clone());
      return fresh;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (!isSameOrigin(url)) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstShell(request));
    return;
  }

  // Fingerprinted build output and the two font files are immutable, so a
  // cached copy can never be stale and this is what makes a cold offline
  // start render in the right typeface.
  if (url.pathname.startsWith(`${SCOPE}assets/`) || url.pathname.startsWith(`${SCOPE}fonts/`)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  if (/\.(?:svg|png|ico|webmanifest|woff2?)$/.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
  }
});
