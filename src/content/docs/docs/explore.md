---
title: Gateways and routes
description: Browse Gateways, ListenerSets and routes, and see why a route is or isn't attached.
---

The header of an install has a tab for each kind it manages: **Gateways**, **Routes** and **ListenerSets**, next to **Overview**, **Findings** and **Processes**.

## Gateways

A Gateway page shows:

- Its conditions, as the controller wrote them.
- **Data plane**: whether its proxies reject config, and what the controller built (listeners, routes, clusters, endpoints).
- **Proxies**: each proxy Pod with its readiness, restarts, last exit and version.
- **Listeners**: port, protocol, hostname, TLS and allowed routes, with the attached route count from status next to the count Snellius computes.
- **ListenerSets** attached to the Gateway.

## Routes

The routes list covers HTTPRoutes, GRPCRoutes, TCPRoutes and TLSRoutes. Filter it by health, or by reason: not accepted, references not resolved, rules replaced or dropped, no parent, selected but not attached, and more.

A route page shows its rules, matches and backend references, and one card per parent with that parent's conditions.

## Why a route is or isn't attached

Gateway API attachment depends on several things at once: the listener's protocol and port, its `allowedRoutes` namespaces and kinds, hostnames and `sectionName`. Snellius computes the outcome with kgateway's own rules for your version, and shows it under each parent as **Computed outcome**, for example:

> No listener allows this route. Listener http allows namespaces with `!edge-http`; the route's namespace has `edge-http=deny`.

Next to it, Snellius says whether the computation is **consistent with the status**. When the two disagree for more than 30 seconds, it raises KGWUI-012. The controller's status still counts; the disagreement is a hint to look closer.

Listener tables show each route's effective hostnames: the intersection of the listener's and the route's hostnames.

## Route delegation

kgateway lets an HTTPRoute delegate to child routes. A parent route has a **Delegation** tab that lists, per delegation reference, the child routes it selects and whether each is attached, dropped or not permitted, and why. A child route shows its effective matches: what it really serves under each parent.

Delegation is computed per install and capped at 10,000 selected edges. Past the cap, parents read "too large to compute". Raise the cap with the chart value `delegation.edgeCap`; a higher cap needs more memory.

## Processes

The **Processes** tab lists the controller's Pods and every Gateway's proxies, with readiness, restarts and versions.
