---
title: Compatibility
description: Supported kgateway versions, and what is stable between releases.
---

## kgateway versions

Every release is tested on kind against these kgateway versions:

| kgateway | Gateway API | Notes |
|---|---|---|
| 2.5 | v1.7 | Policy targets come from the controller's `TargetNotFound` status. KGWUI-024 (config withheld) needs 2.5. |
| 2.4 | v1.6 | Snellius computes "Policy target not found" itself. KGWUI-024 reads "Not available on this version". |
| 2.3 | v1.5 | As 2.4. |

Snellius applies the attachment and delegation rules of the kgateway version it finds. If it cannot read the version, it uses the 2.5 rules and says so.

## What stays stable

- **The URLs** of every page (`/i/{id}/...`), so links and bookmarks keep working.
- **API v1** (`/api/v1/...`): fields are only added, never changed or removed.
- **Finding codes**, such as `KGWUI-013`. A code never changes meaning.

The [upgrade notes](https://github.com/DuncanDoyle/snellius#upgrade-notes) list every change between releases.
