---
title: Health and findings
description: How Snellius decides an install's health, and how to read a finding.
---

Every install has one health state: **healthy**, **warning**, **error** or **unknown**. The overview shows that state and the problems that need attention first, ranked by severity.

## Findings

Each problem is a finding. A finding has:

- **A code**, such as `KGWUI-013`. Codes are stable across releases, so you can search for them and link to them.
- **A severity.** An error turns the install red and a warning turns it yellow. Info never changes the state on its own.
- **Evidence**: the objects involved, the conditions or metrics that raised it, and since when.
- **A fix**: what to change. Some findings also list next-step commands filled in for your install. Snellius never runs them.

"Learn more" on a finding opens its entry in the [finding reference](/docs/findings/).

Findings that look the same are grouped on the overview. For example, five routes that point at the same missing Service show as one group with five affected objects.

## Where findings come from

- **Status.** Conditions the controller wrote, such as `Accepted: False` on a route or `Programmed: False` on a Gateway.
- **Computation.** Checks Snellius runs itself, such as a listener attachment that disagrees with the controller (KGWUI-012). These are labelled **Computed**. The controller's status always wins; a computed finding is a hint you can check.
- **Metrics and signals.** Config the proxies rejected (KGWUI-001), restarting or failing processes (KGWUI-019 to KGWUI-021), version skew (KGWUI-022) and backends without ready endpoints (KGWUI-023).

## Unknown is not healthy

When Snellius cannot see enough to judge, the state is **unknown**, not healthy. That happens, for example, while a controller restarts or before the first metrics scrape. A check that cannot run, because a chart toggle is off or RBAC denies a read, reads **not available** and says why. It does not change the install's state.

## Since when

A finding from a status condition takes the condition's `lastTransitionTime`. For other findings, "since" is when Snellius first saw the problem. Snellius keeps that time in memory, so it resets when the UI restarts.
