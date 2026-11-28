---
title: Gateways and routes
description: Browse kgateway Gateways, ListenerSets and routes, and see why a route is or isn't attached.
head:
  - tag: title
    content: "kgateway Gateways and routes | Snellius"
---

The header of an install has a tab for each kind it manages: **Gateways**, **Routes**, **ListenerSets** and **Policies**, next to **Overview**, **Findings** and **Processes**.

Gateway, ListenerSet, route and backend pages also have a **Policies** section, and an expanded listener row lists the policies that name that listener. See [Policies](/docs/policies/).

## Detail pages

Every detail page (route, Gateway, ListenerSet, policy, backend and finding) shows its sections as cards, always in the same order. On pages with tabs, the cards are on the **Overview** tab. A page shows only the groups it has:

1. **Where it sits**: what leads to the object, and its parents.
2. **Status**: the summary and the conditions.
3. **What it does**: the object's own configuration, such as listeners or rules.
4. **Runtime**: what the data plane does with it.
5. **What acts on it**: the policies that name it.
6. **Related**: child and related objects.

A list on the left shows the sections, with counts where a section has them, and highlights the one in view. In a narrow window, select **Sections** above the cards to open the list. No section is ever collapsed, so the browser's search reaches every section. Details inside a row, such as a rule's details, still open per row.

Select a section in the list, and the address bar shows a link to it, ending in a name such as `#route-rules`. Paste that link in a ticket to open the page at that section.

## Gateways

A Gateway page shows:

- **Summary**, and the **Conditions** as the controller wrote them.
- **Listeners**: port, protocol, hostname, TLS and allowed routes, with the attached route count from status next to the count Snellius computes.
- **ListenerSets** attached to the Gateway.
- The routes attached to the Gateway, and the routes that fail to attach.
- **Data plane**: whether its proxies reject config, and what the controller built (listeners, routes, clusters, endpoints). "Config accepted" means no proxy rejects config or has it withheld, and none is warming up or disconnected. If one is warming up or disconnected, the overview reads **Unknown** and the Gateway page reads **Warning**. Snellius does not compare config versions, so a connected proxy that runs old config still reads as "Config accepted".
- **Proxies**: each proxy Pod with its readiness, restarts, last exit and version.
- **Policies** that name the Gateway.

## Routes

The routes list covers HTTPRoutes, GRPCRoutes, TCPRoutes and TLSRoutes. Filter it by health, or by reason: not accepted, references not resolved, rules replaced or dropped, no parent, selected but not attached, and more.

A route page starts with **Reached through**, the Gateways and parent routes that lead to it, and **Parents**, one card per parent with that parent's conditions. Then come its summary, its rules with matches and backend references, and the policies that name it. A child route also has **Effective matches** after its rules, and a delegating route has **Child routes** at the end.

Each route also shows two signals: **Configuration**, from the route's own status, and **Traffic path**, from the whole path to its backends. The list filters by each. A route can read "Accepted, but no path to a backend", "Not attached to a Gateway" or "Traffic path has errors". A user who cannot read the whole path sees "You don't have permission to check the whole path." See [Two signals per route](/docs/access/#two-signals-per-route).

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
