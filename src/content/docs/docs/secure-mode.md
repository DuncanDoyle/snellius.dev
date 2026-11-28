---
title: Secure mode
description: Sign users in with OIDC, and show each one only what their own Kubernetes RBAC allows.
---

Secure mode signs users in with your identity provider (IdP) and shows the data of the Kubernetes identity that the IdP issues. It needs an IdP that your cluster already trusts for API access.

Managed clusters whose API server accepts only the cloud's own tokens, such as GKE and AKS with Entra ID, are not supported yet. Use local mode there ([#51](https://github.com/DuncanDoyle/snellius/issues/51)).

## Set it up

### 1. Register Snellius as an OIDC client

At your IdP, register a client with these settings:

- Redirect URI: `https://<host>/auth/callback`
- Post-logout redirect URI: `https://<host>/`
- The authorization code flow with PKCE. A client secret is optional.
- The scopes `openid`, `profile`, `email`, `groups` and `offline_access`. To use your own, set `auth.oidc.scopes`. The list must include `openid`.

### 2. Make the cluster accept the client's tokens

Snellius sends the user's ID token to the API server. The API server must accept the client as an audience. Pick one option:

- **Use the client ID the cluster already trusts.** Register Snellius with that client ID. The API server needs no change.
- **Add Snellius's client ID as a second audience.** Add it to `audiences` in the API server's structured authentication configuration. Two audiences need `audienceMatchPolicy: MatchAny`.

This example keeps the claim mappings that the cluster already uses. Yours may differ. It uses `apiserver.config.k8s.io/v1`, which needs Kubernetes 1.34 or later. Kubernetes 1.30 to 1.33 takes the same file as `v1beta1`.

```yaml
apiVersion: apiserver.config.k8s.io/v1
kind: AuthenticationConfiguration
jwt:
  - issuer:
      url: https://idp.example.com
      audiences:
        - kubectl            # the client ID the cluster already trusts
        - snellius           # the Snellius client ID
      audienceMatchPolicy: MatchAny   # required with more than one audience
    claimMappings:
      username:
        claim: email
        prefix: "oidc:"
      groups:
        claim: groups
        prefix: "oidc:"
```

### 3. Create the optional Secret and ConfigMap

A client secret is only for a confidential client. The CA bundle is only for an IdP behind a private CA.

```sh
kubectl create namespace snellius
kubectl -n snellius create secret generic snellius-oidc --from-literal=client-secret='<secret>'
kubectl -n snellius create configmap snellius-oidc-ca --from-file=ca.pem=./idp-ca.pem
```

### 4. Install with the secure-mode values

The issuer and the redirect URL must be https. The client ID must match step 1.

```yaml
auth:
  mode: secure
  oidc:
    issuerURL: https://idp.example.com
    clientID: snellius
    redirectURL: https://snellius.example.com/auth/callback
    clientSecret:
      existingSecret: snellius-oidc   # omit for a public client
    ca:
      existingConfigMap: snellius-oidc-ca   # omit for a public CA
  trustedProxyCIDRs:
    - 10.42.0.0/16   # the Gateway's proxy pods; omit when nothing sits in front of Snellius
httpRoute:
  enabled: true
  parentRefs:
    - name: my-gateway
      namespace: gateway-system
  hostnames:
    - snellius.example.com
```

```sh
helm install ui oci://ghcr.io/duncandoyle/charts/snellius --version 0.9.1 \
  -n snellius --create-namespace -f values.yaml
```

The chart fails to render without `auth.oidc.issuerURL`, `clientID` and `redirectURL`.

`auth.trustedProxyCIDRs` lists the proxies that sit in front of Snellius. For a request from one of them, Snellius keeps its `X-Request-Id`. The audit `source` is the right-most `X-Forwarded-For` address that is not itself a listed proxy. For any other peer, the source is the connection's address, and both headers are ignored. The setting changes only the audit stream and the request ID. It never changes who can sign in or what they see. Without it, every audit `source` is the Gateway's address.

Put the Gateway's own sign-in or access control on the route too, so that only the people you intend reach the sign-in page.

### 5. Check the result

Run `kubectl auth whoami` as the same user, with the same IdP. Open Snellius, sign in, and select **Account details** in the user menu. The username and groups match the `kubectl auth whoami` output.

## How it behaves

- **HTTPS everywhere.** The browser reaches Snellius over https, and the issuer and its endpoints use https. The one exception is a redirect URL on `localhost` or `127.0.0.1`, which can use http for testing. Then also set `auth.session.cookieSecure=false`.
- **Sessions live in memory.** The chart runs one replica, and a restart signs everyone out. A session ends after 30 minutes without a request, or 8 hours after sign-in (`auth.session.idle` and `auth.session.absolute`). Snellius keeps at most 1,000 sessions (`auth.session.max`). The IdP's refresh-token lifetime can end a session sooner. Snellius checks each user's identity again at least every 15 minutes.
- **Permission checks.** Snellius checks each user's access with a SubjectAccessReview. It reuses an allowed answer for 60 seconds (`auth.authz.cacheTTL`, `30s` to `15m`) and a denied one for 4 to 5 minutes. A revoked permission stays visible for at most the allowed TTL. A new grant shows within 5 minutes.
- **Sign-out.** **Sign out** ends the session and sends the browser to the IdP's end-session endpoint, if the IdP publishes one. Snellius sends `client_id` and a `post_logout_redirect_uri` that is the app root. It sends no ID token hint.
- **Sign-in errors.** A failed sign-in lands on `/signin-failed` with one of two reasons. `unauthenticated` means the API server does not accept the token, for example because it does not accept the client ID as an audience. `invalid` means the login attempt has no open transaction or a wrong state, the code exchange or ID token check failed, or the token review itself failed.
- **Request bodies.** A request other than GET or HEAD has its body read before its permission checks: up to 1 MiB within 10 seconds. A larger body answers `413`. An unreadable or stalled one answers `400`.

## Revoke access faster, or check less

- **Faster revocation.** Set `auth.authz.cacheTTL: 30s`, and shorten `auth.session.idle` and `auth.session.absolute`. A `30s` TTL repeats each allowed check twice as often as the default. Idle expiry does not end a session that keeps polling, so use a shorter absolute lifetime where that matters. IdP changes and authorization caches in the API server can take longer.
- **Fewer checks.** A `cacheTTL` up to `15m` trades freshness for fewer checks. A removed RoleBinding then stays effective in Snellius for up to that TTL.

For the limits on how many checks Snellius sends, see [Capacity and tuning](/docs/operations/#capacity-and-tuning).

## Lists and named grants

An object appears in a list, count or summary only when the user may `list` its kind in its namespace, or cluster-wide for a cluster-scoped kind. An object that the user may only `get` by name (a `resourceNames` grant) still opens on its detail page, and shows when an object the user can read names it.

To show such objects in lists too, set `auth.authz.namedGetScan: true`. It costs one check per object that the user cannot list.

## Routes

Secure mode serves `/auth/login`, `/auth/callback`, `/auth/me` and `POST /auth/logout`. `/auth/status` reports the mode and whether sign-in is ready, and local mode serves only that.
