---
title: Security and trust model
description: What Snellius can read, who can see it, and how to expose it safely.
---

Read this before you expose the UI.

## No login yet

Snellius has no login in this release. Whoever can reach the UI sees everything it shows: everything its ServiceAccount can read across the cluster, Deployments included. That can be more than the viewer's own Kubernetes RBAC allows, as with other cluster dashboards. Treat access to the UI as cluster-read access.

Per-user authentication and authorisation is on the [roadmap](https://github.com/DuncanDoyle/snellius/blob/main/docs/roadmap.md).

## Read-only RBAC

The chart's ClusterRole grants only `get`, `list` and `watch`, on:

- Gateway API kinds and all `gateway.kgateway.dev` kinds, plus ReferenceGrants.
- Namespaces, Pods and Deployments.
- Warning Events, Gateway API CRD metadata, and Services with EndpointSlices. Each of these has a chart toggle.

## No Secrets

Snellius never reads Secrets, and its ClusterRole excludes them. It has no access to ConfigMaps, `*/proxy` or `pods/portforward` either. No other field is redacted, because a secret can sit in any field, such as an inline token in a Deployment's env vars.

`diagnostics.controllerLogs` (off by default) adds `get` on `pods/log` in the namespaces listed in `diagnostics.controllerLogsNamespaces` (default `kgateway-system`). Snellius then keeps fixed fields from the log and never stores or shows log text.

## Exposure

The chart creates a ClusterIP Service only, and the default way in is a port-forward. The optional `httpRoute` is off by default. Turn it on only when you put authentication and authorisation on that route, for example a kgateway TrafficPolicy with OIDC or external auth that admits only operators.

## Reporting a vulnerability

Please report security issues privately through [GitHub security advisories](https://github.com/DuncanDoyle/snellius/security/advisories/new), not in a public issue.
