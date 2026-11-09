---
title: Contributing
description: Where the code lives, how to report a problem, and how to help.
---

Snellius is open source under the Apache-2.0 licence. The code, the issues and the releases live on GitHub at [DuncanDoyle/snellius](https://github.com/DuncanDoyle/snellius).

## Report a problem or ask for a feature

Open an [issue](https://github.com/DuncanDoyle/snellius/issues). For a wrong finding or a wrong computed outcome, include the finding code, your kgateway version and the YAML of the objects involved, with anything sensitive removed.

For a security issue, use a private [security advisory](https://github.com/DuncanDoyle/snellius/security/advisories/new) instead.

## Build and test

```sh
make build   # the SPA and the Go binary, with the SPA embedded
make test    # Go tests
make lint    # linters
make e2e     # end-to-end suite on kind
```

`make help` lists every target. The design documents, decisions and [roadmap](https://github.com/DuncanDoyle/snellius/blob/main/docs/roadmap.md) live in the repository's `docs/` folder.

## This website

The site is built with Astro and Starlight from [DuncanDoyle/snellius.dev](https://github.com/DuncanDoyle/snellius.dev). Every page has an "Edit page" link at the bottom.
