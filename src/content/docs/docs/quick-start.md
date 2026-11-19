---
title: Quick start
description: Install Snellius with Helm and open it with a port-forward.
---

You need:

- A Kubernetes cluster that runs kgateway 2.3, 2.4 or 2.5.
- `helm` 3.8 or later, and `kubectl` with access to that cluster.

## 1. Install the chart

```sh
helm install ui oci://ghcr.io/duncandoyle/charts/snellius --version 0.8.2 \
  -n snellius --create-namespace
```

`--version` picks the chart and the matching image. The [releases page](https://github.com/DuncanDoyle/snellius/releases) lists every version.

## 2. Open the UI

```sh
kubectl -n snellius port-forward svc/ui-snellius 8080:80
```

Open [http://localhost:8080](http://localhost:8080).

## 3. Look around

- **Overview.** The install page opens on its health state and the problems that need attention first. With more than one kgateway install, the home page lists them all.
- **Gateways and Routes.** The tabs in the header list every Gateway, ListenerSet and route the install manages. Open one to see its conditions, listeners and attachment.
- **Findings.** Every problem, filterable by severity, code, kind and namespace. "Learn more" on a finding explains its cause and fix; the [finding codes](/docs/findings/) page has every entry.

:::note
This install runs in local mode, with no sign-in. Whoever can port-forward to it sees everything its ServiceAccount can read. To expose it through a Gateway, use [secure mode](/docs/secure-mode/), and read the [security and trust model](/docs/security/) first.
:::

## Uninstall

```sh
helm uninstall ui -n snellius
```
