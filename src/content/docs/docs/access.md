---
title: What each user sees
description: How RBAC shapes the UI in secure mode, what "Not checked" means, and how to scope a page by namespace.
---

In [secure mode](/docs/secure-mode/), each user sees only what their own Kubernetes RBAC lets them read.

## The full read

A user who may `list` the following kinds cluster-wide has the full read, and sees everything Snellius reads:

- Every served Gateway API and kgateway kind.
- Namespaces, Pods, Deployments, Services and EndpointSlices.

Events and CRDs are not part of the full read. See [Events and CRDs](#events-and-crds).

Everyone else is a restricted viewer. These rules apply to them.

## Rules for restricted viewers

- **No trace of hidden objects.** Rows, counts, facets, summaries and health show only objects the user can read. There are no hidden counts, placeholders or "restricted" markers.
- **Findings.** Below the full read, only findings about a user's own objects show. These are a Gateway's or route's own status, and a route's parentRefs, backendRefs and rules. Such a finding shows when the user can read its object and every object that the check named for it, such as all of a route's parents. Every other finding needs the full read. Examples are listener-count disagreement, version skew, proxy stats, process and probe findings, and Backend and endpoint findings such as "no ready endpoints".
- **"Not checked".** In **What was checked**, every check reads "Not checked" for a user without the full read. It means Snellius did not show the result to this user. It does not mean the check passed or failed.
- **Listener checks.** A listener's route-count check shows below the full read only when the user may `list` every route kind in every namespace the listener admits. That is its own namespace for `Same`, and cluster-wide for `All` and `Selector`. A `Selector` listener also needs cluster-wide `list` on Namespaces. Otherwise the listener shows the count of routes the user can read, with no check.
- **Delegation.** Delegation analysis reads every route in the install, so it needs the full read. Below it, the Delegation tab, the counts on a delegation reference, and a child route's effective matches and paths read "Not checked". The Traffic and Backends pages show no paths through a parent route. A route's own status, including which parent routes it names, still shows.
- **Processes and probes.** Process counts need `list` on Deployments and Pods in their namespace. Probe facts need `list` on Events cluster-wide.
- **Endpoints.** Endpoint counts need `list` on EndpointSlices in the Service's namespace. Without it, the Traffic and Backends pages say "You can't read the EndpointSlices in this namespace", with no counts.
- **Installs.** Every signed-in user sees every install's ID and a neutral name. The GatewayClass names, controller readiness and version, and scope details show only when the user can read their source objects. Otherwise the header says "Details not visible to you". An install with nothing the user can read shows empty pages, never a 404.
- **Permissions note.** A user without the full read sees "You see what your Kubernetes permissions allow." in the header. On a narrow window it is an icon with a tooltip.

### Events and CRDs

The full read does not include Events or CustomResourceDefinitions. For every user, including one with the full read:

- Probe facts need cluster-wide `list` on Events.
- CRD bundle-skew findings need cluster-wide `list` on CustomResourceDefinitions.

## What every user shares

Some things are install context. They change what every user sees, even when the user cannot read the object that changed:

- The install list and each install's ID.
- The controller's settings: its scope, version and rule set.
- Install membership: which Gateways, ListenerSets, routes and policies belong to an install.
- Collection failures, and which kinds Snellius itself can read.
- The response's `collectedAt`, which moves when anything in the install changes.

A backend detail page shows when its endpoints were read, and Snellius keeps that read for 5 seconds. A user can therefore learn that someone else opened the same Service within the last 5 seconds. It never shows who, or anything from an object the user cannot read.

## Two signals per route

Each route shows two signals, so that a problem with the route itself is not mixed up with a problem further along.

| Signal | Based on |
|---|---|
| **Configuration** | The route's own status, and the findings on the route whose evidence the user can read. Another object never raises it. |
| **Traffic path** | The whole path: Gateway, listener, route chain, backends and endpoints. It takes the worst state along the path. |

The route's health stays the summary of the two. The route list can filter by each signal. The wording you can see on a route:

| You see | It means |
|---|---|
| Accepted, but no path to a backend | The route has no fault of its own, but no path leads from it to a backend. |
| Not attached to a Gateway | No Gateway listener took the route. |
| Traffic path has errors | A Gateway, listener, backend or endpoint on the path has a problem. |
| You don't have permission to check the whole path. | The user cannot read every object that the path needs, so the state is unknown. |
| Assessment incomplete with your current permissions. | A readable object on the path shows a fault, and part of the path is hidden from the user. |

Snellius decides that a path is incomplete only from what the user may read, never from hidden objects.

## Namespace scope

The namespace selector in the header limits the list pages to the namespaces you choose. Rows, counts, facets and summaries then cover only objects in those namespaces, for every user. A finding without a namespace, such as one about a CRD, falls outside every scope. A dependency in another namespace, such as a route's Gateway, is still checked and shown when the user can read it.

- **One setting per browser.** The browser stores the choice, and it applies to every install. While a scope is active, the header button names it. On a narrow window its icon shows a count. An empty list under a scope says so, and offers "Show all namespaces".
- **Fewer checks.** A scoped list checks permissions only in the chosen namespaces. On a large cluster, this cuts the checks for a cold page about tenfold.
- **API.** The list endpoints `/routes`, `/gateways`, `/listenersets`, `/paths`, `/backends`, `/findings` and `/processes` take `namespaces=a,b`, in both modes. Give it once, with up to 100 names. An empty or invalid value answers `400`. `GET /api/v1/installs/{id}/namespaces` lists the namespaces that hold routes, Gateways or ListenerSets the user can see.
