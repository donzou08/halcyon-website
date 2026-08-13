# Routing

`vercel.json` cannot carry comments, and its route order is load-bearing, so the
reasoning lives here.

This project serves two separate single page applications: the marketing site at
the root, and the portfolio at `/theworks`. Every wrong answer a router can give
is still a valid HTML page, so a mistake here is silent. The order is:

1. **`{ "handle": "filesystem" }`** — real files win. Every portfolio asset,
   every screenshot and every built demo is a real file, so this serves almost
   all of the traffic.

2. **`/theworks/demos/<slug>/` → that demo's own `index.html`.** Named
   explicitly. Each demo is a separate application with its own shell, and if a
   directory request fell through to the rule below, the portfolio's shell would
   render inside the demo's iframe. It looks like a broken demo rather than a
   broken route, which is why it is worth a rule of its own.

3. **`/theworks/...` → `/theworks/index.html`.** The portfolio's client-side
   routes: `/theworks/quotation`, `/theworks/contact` and the rest. Without this
   they reach the marketing page.

4. **Everything else → `/index.html`.** The marketing site.

**Do not add `"//"` keys to vercel.json.** Vercel validates it against a schema
that rejects unknown properties, and the deployment fails rather than warning.

`scripts/serve-like-vercel.mjs` reproduces all of the above locally, including
`cleanUrls` and directory indexes. `npx serve` does not, and the failures it
hides are exactly the silent ones.

## Regenerating /theworks

`theworks/` is built output from the `halcyon-site` repo. Never edit it by hand:

```bash
cd ../halcyon-site
npm run build:all && npm run publish:theworks
```

Then commit here and push.
