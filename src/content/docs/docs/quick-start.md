---
title: Quick start
description: Install Snellius with Helm and open it with a port-forward.
---

You need:

- A Kubernetes cluster that runs kgateway 2.3, 2.4 or 2.5.
- `helm` 3.8 or later, and `kubectl` with access to that cluster.

## 1. Install the chart

```sh
helm install ui oci://ghcr.io/duncandoyle/charts/snellius \
  -n snellius --create-namespace
```

This installs the latest release. Add `--version <version>` to pick one; the [releases page](https://github.com/DuncanDoyle/snellius/releases) lists them.

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
Snellius has no login yet. Anyone who reaches the UI sees what its ServiceAccount can read. Keep it behind a port-forward, or read the [security and trust model](/docs/security/) before you expose it.
:::

## Uninstall

```sh
helm uninstall ui -n snellius
```
