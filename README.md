# snellius.dev

The website for [Snellius](https://github.com/DuncanDoyle/snellius), a read-only UI for Kubernetes Gateway API, built for kgateway. Built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build), served by Cloudflare.

```sh
npm ci
npm run dev            # http://localhost:4321
npm run build          # static site in dist/
npm run sync:findings  # refresh the finding reference from the Snellius repo
```

Needs Node 22.23 or later (`.node-version` pins 24 for Cloudflare). The landing page is `src/pages/index.astro`; the docs are Markdown in `src/content/docs/docs/`.

## Licence

Apache-2.0.
