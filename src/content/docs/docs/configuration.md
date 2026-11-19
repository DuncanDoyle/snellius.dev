---
title: Configuration
description: The Helm values and binary flags you are most likely to change.
---

The [chart README](https://github.com/DuncanDoyle/snellius/blob/main/deploy/helm/snellius/README.md#values) lists every value. These are the ones most people change.

## Helm values

| Value | Default | What it does |
|---|---|---|
| `install.pin` | `""` | Show one install only: its `namespace/name` or install ID. Empty shows all. |
| `auth.mode` | `local` | `local` or `secure`. Local mode has no sign-in and listens on loopback only. Secure mode signs users in with OIDC. Read the [trust model](/docs/security/). |
| `auth.allowedHosts` | `[]` | Local mode: Host names accepted besides `localhost`, `127.0.0.1` and `[::1]`. |
| `auth.oidc.issuerURL` | `""` | Secure mode, required: the OIDC issuer URL, https. |
| `auth.oidc.clientID` | `""` | Secure mode, required: the OIDC client ID. The API server must accept it as an audience. |
| `auth.oidc.redirectURL` | `""` | Secure mode, required: `https://<host>/auth/callback`. |
| `auth.oidc.scopes` | `[]` | OIDC scopes. Empty uses `openid`, `profile`, `email`, `groups` and `offline_access`. |
| `auth.oidc.clientSecret.existingSecret` | `""` | A Secret that holds the client secret. Empty is a public client. |
| `auth.oidc.clientSecret.key` | `client-secret` | The key inside that Secret. |
| `auth.oidc.ca.existingConfigMap` | `""` | A ConfigMap with a PEM bundle, for an IdP behind a private CA. |
| `auth.oidc.ca.key` | `ca.pem` | The key inside that ConfigMap. |
| `auth.session.idle` | `""` | A session ends after this long without a request. Empty uses `30m`. |
| `auth.session.absolute` | `""` | A session ends this long after sign-in. Empty uses `8h`. |
| `auth.session.max` | `""` | The most sessions held at once. Empty uses `1000`. |
| `auth.session.cookieSecure` | `true` | Mark the session cookie Secure. Set `false` only for plain-HTTP testing. |
| `auth.authz.cacheTTL` | `""` | How long an allowed permission check is reused, `30s` to `15m`. Empty uses `60s`. |
| `auth.authz.namedGetScan` | `false` | Also list objects that a user may only `get` by name. Costs one check per hidden object. |
| `auth.authz.maxInFlight` | `""` | The most permission checks in flight at once. Empty uses `32`. See [Capacity and tuning](/docs/operations/#capacity-and-tuning). |
| `auth.authz.rate` | `""` | The most permission checks per second, `1` to `10000`. Empty uses `100`. |
| `auth.authz.burst` | `""` | Checks allowed above `rate` before it applies. Empty uses `500`. |
| `auth.trustedProxyCIDRs` | `[]` | Secure mode: CIDRs of the proxies in front of Snellius. Sets the audit `source` and request ID only. |
| `hostAliases` | `[]` | Pod `hostAliases`, for an IdP name that is not in DNS. |
| `audit.levels` | `[security, agent, reads, summaries]` | The [audit levels](/docs/operations/#audit-stream) written to stdout. `disclosure` and `requests` are also available. |
| `httpRoute.enabled` | `false` | Create an HTTPRoute to the UI. Needs `auth.mode: secure`. Read the [trust model](/docs/security/) first. |
| `httpRoute.parentRefs` | `[]` | The Gateway(s) the route attaches to. |
| `httpRoute.hostnames` | `[]` | Hostnames for the route. |
| `memoryLimit` | `""` | Opt-in Go soft memory limit, set as `GOMEMLIMIT`, for example `300MiB`. Empty uses 90 % of the pod's memory limit. |
| `diagnostics.events` | `true` | Watch Warning Events on controller and proxy Pods. |
| `diagnostics.crds` | `true` | Read Gateway API CRD metadata, for version-skew checks. |
| `diagnostics.proxyStats` | `true` | Read Envoy stats from each proxy Pod on port 9091. |
| `diagnostics.endpoints` | `true` | Watch Services and EndpointSlices, for backends without ready endpoints. |
| `diagnostics.controllerLogs` | `false` | Read controller logs for derived signals. Adds a `pods/log` Role in each namespace of `diagnostics.controllerLogsNamespaces`. |
| `diagnostics.controllerLogsNamespaces` | `[kgateway-system]` | The namespaces that get that Role. List every namespace that runs a kgateway controller. |
| `delegation.edgeCap` | `0` | Delegation edges computed per install; `0` keeps the default of 10,000. |
| `installs.classOnly` | `false` | Also show a GatewayClass whose controller Snellius does not recognise, from Gateway API status alone. From v0.6.0. |
| `extraArgs` | `[]` | More flags for the binary, for example `{--poll-interval=10m}`. |
| `resources` | 50m CPU, 128Mi requested; 512Mi limit | Container resources. |

Turning `events`, `crds` or `endpoints` off also drops its RBAC rule; `proxyStats` needs no RBAC, only network access to port 9091. Checks that need a disabled input read "not available", and the install's state does not change.

## Binary flags

Set these through `extraArgs`, or pass them when you run the binary yourself.

| Flag | Default | What it does |
|---|---|---|
| `--poll-interval` | `30s` | The longest time between recomputes. Snellius recomputes on every change it watches, debounced to about once a second; this is only the safety timer. |
| `--metrics-interval` | `10s` | How often the controller's metrics are scraped. |
| `--delegation-edge-cap` | `10000` | Delegation edges computed per install. A higher cap needs more memory. |
| `--install` | | Same as `install.pin`. |
| `--listen` | `:8080` | Listen address. Outside a cluster the default is `127.0.0.1:8080`. Local mode refuses a non-loopback address. |
| `--probe-listen` | port 8081 in the chart | Listen address for `/healthz`, `/readyz` and `/metrics`. |
| `--auth-mode` | `local` | Same as `auth.mode`. |
| `--audit-levels` | `security,agent,reads,summaries` | Same as `audit.levels`. |
| `--authz-cache-ttl`, `--authz-max-in-flight`, `--authz-rate`, `--authz-burst` | | Same as the `auth.authz.*` values. |
| `--kubeconfig` | | Kubeconfig path. Empty uses the in-cluster config. |

## Run it outside the cluster

To try Snellius against your current kubeconfig context, build it from source:

```sh
git clone https://github.com/DuncanDoyle/snellius && cd snellius
make build
./bin/snellius --kubeconfig ~/.kube/config
```

It serves on [http://127.0.0.1:8080](http://127.0.0.1:8080), with your kubeconfig's permissions.
