---
title: Operate Snellius
description: Capacity and tuning, the audit stream, and the probe port with its metrics.
---

## Capacity and tuning

In [secure mode](/docs/secure-mode/), each restricted viewer's page needs permission checks. Snellius sends them to the API server within these limits. The limits apply across all users, and the checks use their own client, so these are the only throttle.

| Value | Flag | Default | Meaning |
|---|---|---|---|
| `auth.authz.maxInFlight` | `--authz-max-in-flight` | `32` | Checks in flight at once |
| `auth.authz.rate` | `--authz-rate` | `100` | Checks per second, `1` to `10000` |
| `auth.authz.burst` | `--authz-burst` | `500` | Checks allowed above the rate before it applies |
| `auth.authz.cacheTTL` | `--authz-cache-ttl` | `60s` | How long an allowed answer is reused, `30s` to `15m` |

- **Who is affected.** A user with the [full read](/docs/access/#the-full-read) needs no per-object checks, and neither do polls that the cache answers. Only restricted viewers whose cache is cold or expired send checks.
- **Many viewers at once.** Page loads that need new checks wait in turn, oldest first. After a restart, when many restricted viewers load a page at the same moment, the last one can wait minutes. When too many requests wait, Snellius answers `503 authz-busy`. The page then says Snellius is busy, and retries on its next poll. A failed check answers `503 authz-unavailable` instead.
- **How much the default carries.** On a cluster of about 100 namespaces, 50 restricted viewers who poll the Backends page every 5 seconds need about 95 checks per second. That is close to the default of 100. Their polls then slow to about 12 seconds, and still answer. Sustained demand above the rate answers `503 authz-unavailable`.
- **What to do.** Raise `auth.authz.rate` when many restricted viewers use a large cluster, and make sure the API server can take the load. Ask users to pick a namespace in the header. A scoped page checks only those namespaces, which cuts the checks for a cold page about tenfold on a large cluster.
- **Memory.** The permission cache holds about 40,000 answers in 8 MiB. Its size is not a setting.
- **Watch it.** `snellius_authz_checks_total{verb,outcome}`, `snellius_authz_cache_total{result}` and `snellius_authz_cache_evictions_total` on `/metrics` show the load and the cache. A rising `authz-unavailable` count in the audit stream, with the reason `expired` or `check-limit`, says the limits are too low for the demand.

## Audit stream

Snellius writes audit records as JSON lines on stdout, each with `"log":"snellius.audit"`. Operational logs use a different format. Snellius does not store, rotate or sign the records. Keep and protect them in your log collector or SIEM.

Select the levels with `--audit-levels`, or the chart value `audit.levels`. The default is `security,agent,reads,summaries`.

| Level | Default | Records |
|---|---|---|
| `security` | on | Startup (with the mode and listen address), sign-in success and failure, sign-out, a session that ends, a session evicted at the limit, a refused request (`denial`), and `authz-unavailable` with its reason |
| `agent` | on | Each agent tool call. Nothing emits it yet. |
| `reads` | on | Each detail, YAML or export read |
| `summaries` | on | List and overview access, counted per session, endpoint and filter set |
| `disclosure` | off | The object references that a response returned |
| `requests` | off | Every API request |

- **Collapsing.** Repeated denials of the same request collapse into one record per minute, with a `count`. Summaries flush every 5 minutes and at shutdown, with a `count`. Rows left out of a list are filtering, not denials, so Snellius does not record them.
- **Fields.** `schema`, `id`, `time` (UTC), `level`, `action`, `outcome`, `reason`, `user` (issuer and subject), `kube` (username and groups), `session` (an opaque ID, not the cookie), `request` (ID, method, route template and allow-listed filters), `install`, `server`, `refs`, `source`, `userAgent` and `count`. Empty fields are left out.
- **Never recorded.** Tokens, cookies, raw query strings and response bodies.
- **Matching a response.** Every response carries `X-Request-Id`. The same value is in the `request.id` of the audit records that the request wrote, so a user's report maps to its lines.
- **Local mode.** Local mode writes only the startup record.
- **Drops.** A record that cannot be queued or written counts in `snellius_audit_dropped_total{level}`. A window holds at most 10,000 open keys. Past that, the oldest flushes early.

## Probe port and metrics

The probe listener serves `/healthz`, `/readyz` and `/metrics` on container port `probe` (8081, `--probe-listen`), in both modes. It serves no cluster data, and `/readyz` lists no install IDs. The chart's probes use it. Scrape `/metrics` on that port. If a NetworkPolicy limits traffic to the pod, allow your scraper to reach port 8081.

| Metric | Meaning |
|---|---|
| `snellius_auth_mode{mode}` | The running mode |
| `snellius_audit_records_total{level}`, `snellius_audit_dropped_total{level}` | Audit records written and dropped |
| `snellius_sessions_active` | Signed-in sessions in memory |
| `snellius_authz_checks_total{verb,outcome}`, `snellius_authz_check_seconds_total` | Permission checks sent, by result, and their time |
| `snellius_authz_cache_total{result}`, `snellius_authz_cache_evictions_total`, `snellius_authz_cache_bytes`, `snellius_authz_identities` | The permission cache |
| `snellius_limit_hits_total{limit}` | Hits of Snellius's own size limits |
