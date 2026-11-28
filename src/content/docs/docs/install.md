---
title: Install and configure
description: Install Snellius with Helm, pin it to one kgateway install, and expose it safely.
head:
  - tag: title
    content: "Install the Snellius UI for kgateway with Helm"
---

Snellius ships as a container image, `ghcr.io/duncandoyle/snellius`, and a Helm chart, `oci://ghcr.io/duncandoyle/charts/snellius`. Each release publishes both with the same version.

## Install

```sh
helm install ui oci://ghcr.io/duncandoyle/charts/snellius --version 0.9.2 \
  -n snellius --create-namespace
kubectl -n snellius port-forward svc/ui-snellius 8080:80
```

`--version` picks the chart and the matching image. The chart installs a Deployment, a ClusterIP Service, a ServiceAccount, a read-only ClusterRole and its binding. It starts in [local mode](/docs/security/#local-mode). The [configuration reference](/docs/configuration/) lists the values you are most likely to change.

To install from a checkout, set the image tag to a released version: `--set image.tag=<version>`. The `appVersion` in the repository is not bumped on release, so without the tag the checkout runs an older image.

## Upgrade

```sh
helm upgrade ui oci://ghcr.io/duncandoyle/charts/snellius --version 0.9.2 -n snellius --reuse-values
```

Read the [release notes](/docs/releases/) first. They list every change in behaviour, release by release.

:::caution
If you expose Snellius through an HTTPRoute, v0.8.0 refuses to render it in local mode. Switch to [secure mode](/docs/secure-mode/) or turn the route off before you upgrade. See the [release notes](/docs/releases/#before-you-upgrade).
:::

## How Snellius finds kgateway

An install is a kgateway controller Deployment with the labels `kgateway=kgateway` and `app.kubernetes.io/component=controller`, running a container image named `kgateway`. The kgateway Helm chart sets all three; an image from a mirror registry is fine. Snellius shows every install it finds, so one Snellius can watch several kgateway installs in the same cluster.

To show only one, pin it:

```sh
helm upgrade ui oci://ghcr.io/duncandoyle/charts/snellius -n snellius \
  --reuse-values --set install.pin=kgateway-system/kgateway
```

`install.pin` takes the controller's `namespace/name` or an install ID.

Snellius honours each controller's `discoveryNamespaceSelectors`. It only counts resources in namespaces the controller watches, and the install page shows the scope as "N of M namespaces".

## Expose it through a Gateway

By default the chart creates a ClusterIP Service only, and you reach the UI with a port-forward. To serve it through a Gateway instead, first read the [security and trust model](/docs/security/). The route needs [secure mode](/docs/secure-mode/), where users sign in with OIDC. The chart refuses `httpRoute.enabled` in local mode. Then set:

```yaml
auth:
  mode: secure
  # auth.oidc.issuerURL, clientID and redirectURL are required; see Secure mode
httpRoute:
  enabled: true
  parentRefs:
    - name: edge
      namespace: infra
  hostnames:
    - snellius.example.com
```

Also put your Gateway's own access control on the route, so that only the people you intend reach the sign-in page.

## Network access

In the cluster, Snellius scrapes the controller Pods on port 9092 and reads Envoy stats from each proxy Pod on port 9091. If a NetworkPolicy blocks either, the UI reports that signal as "not available" instead of showing it green. Your own scraper needs port 8081 for the pod's `/metrics`. See [Operate Snellius](/docs/operations/#probe-port-and-metrics). See [Compatibility](/docs/compatibility/) for what each kgateway version reports.

## Troubleshooting

| You see | Check |
|---|---|
| "No kgateway install found" | The controller Deployment has both labels above, its image is named `kgateway`, and the UI's ServiceAccount can list Deployments. |
| Your kgateway controller runs a custom build under another image name | Set `installs.classOnly=true`. Snellius then adds an install for its GatewayClass `controllerName`, from Gateway API status only: no version, processes or kgateway-specific checks. It does so only when no detected install already uses that `controllerName`. |
| A check reads "not available" | The finding page says why: a chart toggle is off, RBAC denies the read, or the network blocks the port. |
| Another pod or proxy can no longer reach the UI after you upgrade to v0.8.0 | Local mode listens on the pod's loopback only. Switch to [secure mode](/docs/secure-mode/), or reach the UI with a port-forward. |
| `helm` refuses to render the chart | `httpRoute.enabled` needs `auth.mode: secure`, and secure mode needs `auth.oidc.issuerURL`, `clientID` and `redirectURL`. |
| A request gets 421 in local mode | The Host is not `localhost`, `127.0.0.1` or `[::1]`. Add it to `auth.allowedHosts`. |
| Sign-in lands on `/signin-failed` | See [sign-in errors](/docs/secure-mode/#how-it-behaves). |
| Counts lower than you expect | The controller's `discoveryNamespaceSelectors`. Snellius counts only the namespaces the controller watches. |
