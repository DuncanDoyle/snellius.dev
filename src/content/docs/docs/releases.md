---
title: Release notes
description: What changes for you in each Snellius release, and what to do before you upgrade.
---

This page covers the changes you see in the UI and in the chart. The [upgrade notes](https://github.com/DuncanDoyle/snellius#upgrade-notes) in the repository also list API and extension changes.

## v0.8.2

- **Intro in local mode.** Local mode has no sign-in, so the intro plays on the first page load in each browser tab instead. A reload in the same tab does not replay it.
- **Sign-in intro.** The finished prism and name hold for about 0.7 s before the intro fades, and the prism's outline closes at its apex.
- No chart values, flags or API fields change. Upgrade with `--version 0.8.2`.

## v0.8.1

- **Sign-in intro.** In secure mode, a fresh sign-in plays a short animation of the Snellius prism while the overview loads. A click or key press skips it. It never plays with reduced motion, on a reload, or on later navigation.
- No chart values, flags or API fields change. Upgrade with `--version 0.8.1`.

## v0.8.0: identity and access

### Before you upgrade

**`httpRoute.enabled` needs `auth.mode: secure`.** Up to v0.7.x, an HTTPRoute let anyone who reached its hostname see everything the Snellius ServiceAccount can read, with no sign-in. The new default, local mode, listens only on the pod's loopback. An HTTPRoute would then either reach nothing, or expose that same unauthenticated view through the Gateway. So the chart refuses to render the HTTPRoute in local mode.

Before you upgrade an install that uses an HTTPRoute, choose one:

1. Set `auth.mode: secure` with the `auth.oidc.*` values. See [Secure mode](/docs/secure-mode/).
2. Set `httpRoute.enabled: false`, and reach the UI with `kubectl port-forward`.

A cluster whose API server cannot accept Snellius's token, such as GKE and AKS with Entra ID, has only the second choice in v0.8.0 ([#51](https://github.com/DuncanDoyle/snellius/issues/51)).

### What changes

- **Default mode is local.** The UI listens on `127.0.0.1:8080` in the pod. From outside the pod, only `kubectl port-forward` reaches it. Anything that called the UI through the Service or the pod IP, such as another pod or a proxy, no longer reaches it. Upgrades with `--reuse-values` from older releases work.
- **Secure mode.** Users sign in with OIDC, and each user sees only what their own RBAC allows. See [Secure mode](/docs/secure-mode/) and [What each user sees](/docs/access/).
- **One replica.** Sessions live in memory, and a restart signs everyone out.
- **ClusterRole.** In secure mode only, it gains `create` on `tokenreviews` and `subjectaccessreviews`.
- **What users see.** Restricted viewers see only findings about their own objects, and "Not checked" where a check needs the full read.
- **Events and CRDs.** The full read does not include them. Probe facts need cluster-wide `list` on Events, and CRD bundle-skew findings need cluster-wide `list` on CustomResourceDefinitions, for every user.
- **Two signals per route.** Each route shows **Configuration** and **Traffic path**. See [Two signals per route](/docs/access/#two-signals-per-route).
- **Namespace scope.** The header has a namespace selector that limits the list pages. See [Namespace scope](/docs/access/#namespace-scope).
- **Request bodies.** In secure mode, a request other than GET or HEAD has its body read first: up to 1 MiB within 10 seconds. A larger body answers `413`, and an unreadable or stalled one `400`.
- **Probe port.** Liveness and readiness probes use the new `probe` port (8081). `/readyz` no longer lists install IDs. `/metrics` is on that port. See [Operate Snellius](/docs/operations/#probe-port-and-metrics).
- **Audit stream.** JSON lines on stdout, set with `audit.levels`. See [Audit stream](/docs/operations/#audit-stream).
- **Capacity.** New limits on permission checks. See [Capacity and tuning](/docs/operations/#capacity-and-tuning).
- **Downstream builds.** In secure mode, an authoriser that a build registers only narrows what a user may read. Kubernetes RBAC decides first.
- **Istio.** In local mode the pod gets the annotation `sidecar.istio.io/inject: "false"` and the label `istio.io/dataplane-mode: none`.

### New chart values

`auth.mode`, `auth.allowedHosts`, `auth.oidc.*`, `auth.session.*`, `auth.authz.*`, `auth.trustedProxyCIDRs`, `audit.levels`, `hostAliases` and `memoryLimit`. The [configuration reference](/docs/configuration/) lists them with their defaults.

### Finding codes

The [finding codes](/docs/findings/) page is synced for this release. KGWUI-023 now says what a route sees with no ready endpoint. A check can wait before it decides, and then reads "Deciding" instead of green.

## v0.7.1

A route that sends traffic to a backend with an error or warning finding, such as a Service with no ready endpoints (KGWUI-023), is now at least a warning. It carries the `backend-problem` flag, and its reason names the backend and the finding. The routes list takes `state=backend-problem`.

## v0.7.0: traffic flow and backends

The install nav gains **Traffic** and **Backends**. Route detail covers GRPCRoute, TCPRoute and TLSRoute. API v1 changes are additive.
