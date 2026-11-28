---
title: Policies
description: See which kgateway policies name an object, and what kgateway reports about each one.
head:
  - tag: title
    content: "kgateway policies: targets and status | Snellius"
---

The policy pages answer one question: which policies name this object, and what does kgateway report about them? They show what a policy's spec declares and what kgateway writes in its status. Snellius never decides whether a policy applies. It does not work out attachment, inheritance, precedence, merges or overrides.

## The Policies list

Each install has a **Policies** tab. It lists the install's policies, DirectResponse included, with:

- The targets, as written in the spec.
- **Accepted**, summarised from kgateway's status.
- **Reported attached on**: where kgateway's status says the policy is attached.
- The features each policy sets, such as timeouts or header changes.

Filter the list by kind, feature, namespace or **Has problems**. The [namespace scope](/docs/access/#namespace-scope) in the header applies too, and the namespace filter narrows within it.

The list is sorted by namespace and name. The order says nothing about which policy wins.

## A policy's page

A policy page has an Overview tab with these sections, in this order, and a **YAML** tab:

- **Summary** of the policy.
- **Status per ancestor.** kgateway writes a status entry for each object the policy reaches, such as a Gateway or a backend port. Gateway API calls that object an ancestor. Snellius shows each entry as written. Entries from another controller or install, and entries that are stale or still waiting for status, stay visible but count in no summary.
- **Targets.** Each targetRef with its check: found, not found, section not found, or not checked. Label selectors show as written, with no check.
- **Configuration by feature**, read from the spec.
- **Precedence annotations** as written, such as `kgateway.dev/policy-weight` and `kgateway.dev/inherited-policy-priority`. Snellius never evaluates them.

## Policies on other pages

Gateway, ListenerSet, route and backend pages have a **Policies** section with up to three groups:

- **Targeting this object**: a targetRef names the object or one of its sections.
- **Targeting a parent** (routes and ListenerSets): a targetRef names a parent from the object's own parentRefs. A route whose parentRef names a whole Gateway lists no listener-level policies; the Gateway page does. A route whose parentRef names a ListenerSet can also list the policies on that ListenerSet's whole Gateway, when you can read both. kgateway decides whether and how these policies apply.
- **Reported attached here** (Gateways, ListenerSets and backends): kgateway's current status reports the policy attached on this object.

Each group lists only policies you can read. Snellius never matches label selectors to build these groups. A policy that selects only by label can still show under **Reported attached here**, because that group comes from kgateway's status. For policies that select by label, the section links to the Policies list.

On a Gateway or ListenerSet page, an expanded listener row lists **Policies that name this listener**: the policies whose targetRef names that listener. Policies on the whole Gateway or ListenerSet stay in the page's Policies section.

A policy name opens its policy page when the install owns or lists the policy and you may read it by name. Otherwise the name shows without a link. A policy that a route names from another install opens its YAML.

## Where a value comes from

Every policy value carries a tag:

| Tag | Meaning | Example |
|---|---|---|
| Declared | Written in a spec. | A targetRef as written. |
| Reported | Written by kgateway in status. | An ancestor's `Accepted=False` with reason `Invalid`, shown as is. |
| Inferred | Worked out by Snellius. | A target check, or the list's Accepted summary. |
| Unknown | Nothing can tell, or you cannot read the input. | A target you have no permission to read. |

## What Snellius does not show

Snellius does not show a route's effective policy, which policy wins, the outcome of a merge or override, or the objects a label selector matches. kgateway reports `Accepted` and `Attached` per Gateway, ListenerSet or backend port, not per route. A `Merged` or `Overridden` reason on a Gateway covers the whole Gateway. Working out the rest would mean copying kgateway's own resolution logic, so Snellius leaves it out.

A runtime view is planned: what Envoy runs for a route, and which policies contributed to it. It needs access that the chart does not grant today.

## Rejected policies

When kgateway rejects a policy, Snellius raises [KGWUI-002](/docs/findings/#kgwui-002). On kgateway 2.5, a policy whose target is not found raises [KGWUI-016](/docs/findings/#kgwui-016) instead. An ancestor entry whose `Accepted` is stale or still pending reads [KGWUI-003](/docs/findings/#kgwui-003). A DirectResponse can raise KGWUI-002 too. The [finding codes](/docs/findings/) page has the exact rules, including the exceptions for DirectResponse.

## API

- `GET /api/v1/installs/{id}/policies` lists the policies. It takes the filters `kind`, `feature`, `namespace` and `hasProblems`, and the namespace scope `namespaces`.
- `GET /api/v1/installs/{id}/policies/{group}/{kind}/{ns}/{name}` returns one policy. Use `-` for the core group.
- Gateway, ListenerSet, route and backend details carry `policyRelations`.
