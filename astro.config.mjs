// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

const repo = "https://github.com/DuncanDoyle/snellius";

export default defineConfig({
  site: "https://snellius.dev",
  integrations: [
    starlight({
      title: "Snellius",
      description: "A read-only UI for Kubernetes Gateway API, built for kgateway.",
      logo: { src: "./src/assets/brand/snellius-symbol-dark.svg", alt: "Snellius" },
      favicon: "/favicon.svg",
      social: [{ icon: "github", label: "Snellius on GitHub", href: repo }],
      editLink: { baseUrl: "https://github.com/DuncanDoyle/snellius.dev/edit/main/" },
      customCss: ["./src/styles/fonts.css", "./src/styles/docs.css"],
      head: [
        { tag: "link", attrs: { rel: "icon", href: "/favicon.ico", sizes: "32x32" } },
        { tag: "link", attrs: { rel: "apple-touch-icon", href: "/apple-touch-icon.png" } },
        { tag: "meta", attrs: { property: "og:image", content: "https://snellius.dev/og.png" } },
        { tag: "meta", attrs: { name: "twitter:card", content: "summary_large_image" } },
      ],
      sidebar: [
        { label: "Start here", items: ["docs", "docs/quick-start"] },
        {
          label: "Guides",
          items: ["docs/install", "docs/health", "docs/explore", "docs/security"],
        },
        {
          label: "Reference",
          items: ["docs/configuration", "docs/findings", "docs/compatibility"],
        },
        { label: "Project", items: ["docs/contributing"] },
      ],
    }),
  ],
});
