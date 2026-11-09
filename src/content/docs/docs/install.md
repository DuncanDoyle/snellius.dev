---
title: Install and configure
description: Install Snellius with Helm, pin it to one install, and expose it safely.
---

Snellius ships as a container image, `ghcr.io/duncandoyle/snellius`, and a Helm chart, `oci://ghcr.io/duncandoyle/charts/snellius`. Each release publishes both with the same version.

## Install

```sh
helm install ui oci://ghcr.io/duncandoyle/charts/snellius \
  -n snellius --create-namespace
```

The chart installs a Deployment, a ClusterIP Service, a ServiceAccount, a read-only ClusterRole and its binding. The [configuration reference](/docs/configuration/) lists the values you are most likely to change.

## Upgrade

```sh
helm upgrade ui oci://ghcr.io/duncandoyle/charts/snellius -n snellius --reuse-values
```

Read the [upgrade notes](https://github.com/DuncanDoyle/snellius#upgrade-notes) first. They list every change in behaviour, release by release.

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

By default the chart creates a ClusterIP Service only, and you reach the UI with a port-forward. To serve it through a Gateway instead, first read the [security and trust model](/docs/security/), then put authentication in front of the route, for example a kgateway TrafficPolicy with OIDC or external auth. Then set:

```yaml
httpRoute:
  enabled: true
  parentRefs:
    - name: edge
      namespace: infra
  hostnames:
    - snellius.example.com
```

## Network access

In the cluster, Snellius scrapes the controller Pods on port 9092 and reads Envoy stats from each proxy Pod on port 9091. If a NetworkPolicy blocks either, the UI reports that signal as "not available" instead of showing it green. See [Compatibility](/docs/compatibility/) for what each kgateway version reports.

## Troubleshooting

| You see | Check |
|---|---|
| "No kgateway install found" | The controller Deployment has both labels above, its image is named `kgateway`, and the UI's ServiceAccount can list Deployments. |
| Your kgateway controller runs a custom build under another image name | Set `installs.classOnly=true`. Snellius then shows the controller from its GatewayClass and Gateway API status, without the kgateway-specific checks. |
| A check reads "not available" | The finding page says why: a chart toggle is off, RBAC denies the read, or the network blocks the port. |
| Counts lower than you expect | The controller's `discoveryNamespaceSelectors`. Snellius counts only the namespaces the controller watches. |
