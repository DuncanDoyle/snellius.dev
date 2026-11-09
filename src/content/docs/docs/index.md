---
title: What is Snellius?
description: A read-only UI for Kubernetes Gateway API, built for kgateway.
sidebar:
  label: Overview
---

Snellius is a read-only web UI for Kubernetes Gateway API, built for [kgateway](https://kgateway.dev). It answers three questions about each kgateway install in your cluster:

- **Is it healthy?** One health state per install, with problems ranked by severity.
- **Why?** Every problem is a finding with a stable code, the evidence behind it and how to fix it.
- **What does it manage?** Gateways, ListenerSets, routes and the policies attached to them.

Snellius runs in your cluster as one Deployment. It watches the Kubernetes API with `get`, `list` and `watch`, scrapes the kgateway controller's metrics, and never changes anything.

## What it reads

Snellius combines four kinds of observation into one picture:

| Source | What it tells Snellius |
|---|---|
| Resource status | The conditions kgateway writes on Gateways, routes and policies. |
| Computed attachment | Which listeners should accept each route, and how delegation resolves, using kgateway's own rules. Compared with the status above. |
| Controller metrics | Config the proxies rejected, and what the controller built for each Gateway. |
| Proxy and pod signals | Readiness, restarts, Warning Events and Envoy stats from each proxy. |

The controller's status always wins. Where Snellius computes something itself, the UI labels it **Computed** and says whether the controller agrees.

## Where to go next

- [Quick start](/docs/quick-start/): install Snellius and open it in five minutes.
- [Security and trust model](/docs/security/): read this before you expose the UI.
- [Finding codes](/docs/findings/): every finding, its cause and its fix.
