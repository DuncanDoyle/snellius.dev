# snellius.dev

The website for [Snellius](https://github.com/DuncanDoyle/snellius), a read-only UI for Kubernetes Gateway API, built for kgateway. Built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build), served by Cloudflare.

```sh
npm ci
npm run dev            # http://localhost:4321
npm run build          # static site in dist/
npm run sync:findings  # refresh the finding reference from the Snellius repo
```

The site is Snellius's user documentation and follows its releases: a Snellius change that users can see updates this site in the same release (program decision P-006 in [kgateway-tooling](https://github.com/DuncanDoyle/kgateway-tooling/blob/main/program.md)). Run `npm run sync:findings` after the finding reference changes.

Needs Node 22.23 or later (`.node-version` pins 24 for Cloudflare). The landing page is `src/pages/index.astro`; the docs are Markdown in `src/content/docs/docs/`.

## Licence

Apache-2.0.
