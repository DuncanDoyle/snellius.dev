---
title: Configuration
description: The Helm values and binary flags you are most likely to change.
---

The [chart README](https://github.com/DuncanDoyle/snellius/blob/main/deploy/helm/snellius/README.md#values) lists every value. These are the ones most people change.

## Helm values

| Value | Default | What it does |
|---|---|---|
| `install.pin` | `""` | Show one install only: its `namespace/name` or install ID. Empty shows all. |
| `httpRoute.enabled` | `false` | Create an HTTPRoute to the UI. Read the [trust model](/docs/security/) first. |
| `httpRoute.parentRefs` | `[]` | The Gateway(s) the route attaches to. |
| `httpRoute.hostnames` | `[]` | Hostnames for the route. |
| `diagnostics.events` | `true` | Watch Warning Events on controller and proxy Pods. |
| `diagnostics.crds` | `true` | Read Gateway API CRD metadata, for version-skew checks. |
| `diagnostics.proxyStats` | `true` | Read Envoy stats from each proxy Pod on port 9091. |
| `diagnostics.endpoints` | `true` | Watch Services and EndpointSlices, for backends without ready endpoints. |
| `diagnostics.controllerLogs` | `false` | Read controller logs for derived signals. Adds a `pods/log` Role. |
| `delegation.edgeCap` | `0` | Delegation edges computed per install; `0` keeps the default of 10,000. |
| `installs.classOnly` | `false` | Also show a GatewayClass whose controller Snellius does not recognise, from Gateway API status alone. From v0.6.0. |
| `extraArgs` | `[]` | More flags for the binary, for example `{--poll-interval=10m}`. |
| `resources` | 50m CPU, 128Mi requested; 512Mi limit | Container resources. |

Turning a `diagnostics` toggle off also drops its RBAC rule. Checks that need it then read "not available", and the install's state does not change.

## Binary flags

Set these through `extraArgs`, or pass them when you run the binary yourself.

| Flag | Default | What it does |
|---|---|---|
| `--poll-interval` | `30s` | The longest time between recomputes. Snellius recomputes on every change it watches, debounced to about once a second; this is only the safety timer. |
| `--metrics-interval` | `10s` | How often the controller's metrics are scraped. |
| `--delegation-edge-cap` | `10000` | Delegation edges computed per install. A higher cap needs more memory. |
| `--install` | | Same as `install.pin`. |
| `--listen` | `:8080` | Listen address. Outside a cluster the default is `127.0.0.1:8080`. |
| `--kubeconfig` | | Kubeconfig path. Empty uses the in-cluster config. |

## Run it outside the cluster

To try Snellius against your current kubeconfig context, build it from source:

```sh
git clone https://github.com/DuncanDoyle/snellius && cd snellius
make build
./bin/snellius --kubeconfig ~/.kube/config
```

It serves on [http://127.0.0.1:8080](http://127.0.0.1:8080), with your kubeconfig's permissions.
