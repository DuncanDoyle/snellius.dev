---
title: Security and trust model
description: The two modes, what Snellius can read, who can see it, and how to expose it safely.
---

Read this before you expose the UI.

Snellius runs in one of two modes. Set the mode with the chart value `auth.mode`, or the flag `--auth-mode`. The default is `local`.

| | Local mode | Secure mode |
|---|---|---|
| Sign-in | None | OIDC |
| Listens on | `127.0.0.1:8080` in the pod | `:8080` on the pod IP |
| Reached through | `kubectl port-forward` | A Gateway route, or the Service |
| What a user sees | Everything Snellius can read | What the user's own RBAC allows |
| Permission checks | None | SubjectAccessReview, on the API server |
| ClusterRole extras | None | `create` on `tokenreviews` and `subjectaccessreviews` |

Use secure mode for any install that you expose through a Gateway. [Secure mode](/docs/secure-mode/) has the setup steps.

## Local mode

Local mode has no sign-in.

- The UI and API listen on `127.0.0.1:8080` inside the pod. From outside the pod, only `kubectl port-forward` reaches them.
- Containers in the pod share its network. A sidecar or a chart `extraContainers` entry can reach the listener too. Add only containers that you trust with everything Snellius can read.
- Whoever can port-forward to Snellius sees everything Snellius can read. That is everything its ServiceAccount can read across the cluster, Deployments included. It can be more than that person's own Kubernetes RBAC allows. Port-forwarding needs `pods/portforward` in the Snellius namespace.
- A request whose Host is not `localhost`, `127.0.0.1` or `[::1]` gets 421. Add other names with `auth.allowedHosts`. A request whose Origin is not its own scheme, host and port gets 403.
- Every page shows the banner "Local mode: no sign-in. Anyone with port-forward access sees everything Snellius can read."
- The binary refuses a non-loopback `--listen`, and a pod on host networking. The chart refuses `httpRoute.enabled`.

## Secure mode

Users sign in with OIDC. Snellius answers `401` to an `/api/` request without a session. Each user sees only what their own Kubernetes RBAC allows. See [What each user sees](/docs/access/) for the rules.

## Both modes

- **What Snellius reads.** Snellius reads the cluster with its own ServiceAccount, never with a user's token. A user can never see more than the ServiceAccount can read, whatever their own RBAC allows.
- **Where checks happen.** In secure mode, Snellius asks the API server whether the signed-in user may read each object. It sends a SubjectAccessReview as that user, and filters its own data with the answer. The API server stays the only place that evaluates RBAC.
- **Audit stream.** Snellius writes JSON audit lines to stdout. See [Audit stream](/docs/operations/#audit-stream).
- **Request IDs.** Every response from the UI and API listener carries an `X-Request-Id`.

## Read-only RBAC

The chart's ClusterRole grants only `get`, `list` and `watch`, on:

- Gateway API kinds and all `gateway.kgateway.dev` kinds, plus ReferenceGrants.
- Namespaces, Pods and Deployments.
- Warning Events, Gateway API CRD metadata, and Services with EndpointSlices. Each of these has a chart toggle.

Secure mode adds `create` on `tokenreviews` and `subjectaccessreviews`.

## No Secrets

Snellius never reads Secrets, and its ClusterRole excludes them. It has no access to ConfigMaps, `*/proxy` or `pods/portforward` either. No other field is redacted, because a secret can sit in any field, such as an inline token in a Deployment's env vars.

In secure mode, the client secret, the ID token, the refresh token and the user's bearer token never reach the browser or the logs. The browser holds only an opaque session cookie.

`diagnostics.controllerLogs` (off by default) adds `get` on `pods/log` in the namespaces listed in `diagnostics.controllerLogsNamespaces` (default `kgateway-system`). Snellius then keeps fixed fields from the log and never stores or shows log text.

## Exposure

The chart creates a ClusterIP Service only, and the default way in is a port-forward. The optional `httpRoute` needs secure mode: the chart refuses to render it in local mode. Put your Gateway's own access control on the route too, so that only the people you intend reach the sign-in page.

## Reporting a vulnerability

Please report security issues privately through [GitHub security advisories](https://github.com/DuncanDoyle/snellius/security/advisories/new), not in a public issue.
