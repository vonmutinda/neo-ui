# Money Flow Map: Implementation Prompt

Use this document as the refined spec and prompt for implementing IP-based money flow visualization on the admin dashboard.

---

## Goal

- Visualize **movement of money by location** in the admin dashboard using a map.
- Location is derived from **user IP** (session IP at login, and optionally request IP at transfer time).

---

## Backend (neo)

### 1. IP capture on transfer audit (context-based)

- Add **middleware** that sets client IP on the request context (same extraction as auth: `X-Forwarded-For` then `RemoteAddr`). Attach to the personal API router (and any router that triggers transfer audit).
- In the **payment service**, when building `AuditEntry` for transfer-related actions (e.g. `AuditTransferInitiated`, `AuditP2PTransfer`), read IP from context and set `e.IPAddress` if present. Leave IP nil for system-only entries (e.g. settled/voided).
- Do **not** change payment method signatures; use context only so any future handler can log audit with IP the same way.

### 2. Geolocation

- Use **MaxMind GeoLite2** (or GeoIP2) in the backend so IPs are not sent to third parties and there are no external rate limits.
- Add a small **geo package** (e.g. `pkg/geo` or `internal/geo`) that resolves IP → lat/long (and optionally city/country). Use it only in the admin money-flow map flow.

### 3. Money flow map endpoint

- **Endpoint:** `GET /admin/v1/analytics/money-flow-map?from=...&to=...&limit=500`
- **Permission:** `analytics:read` (same as other analytics).
- **Phase 1 (session-based):** Join transactions (sender_user_id, recipient_user_id, amount, created_at) to “last session per user” (sessions.ip_address). Resolve those IPs to lat/long via the geo package. Return points and/or flows (e.g. from sender’s last IP to recipient’s last IP). This works without changing payment audit and gives a working map quickly.
- **Phase 2 (audit-based):** Once transfer audit stores IP (step 1), optionally switch or add a data source that uses transfer audit entries (`resource_type = 'transfer'`, actions like `transfer_initiated`, `p2p_transfer`) with non-null `ip_address`, joined to transaction receipts via metadata for amount/currency. Same response shape; more accurate “where the transfer request came from.”
- **Response shape (example):**  
  `{ "points": [ { "lat", "lon", "amountCents", "currency", "type", "createdAt", "transactionId" } ], "flows": [ { "from": { "lat", "lon" }, "to": { "lat", "lon" }, "amountCents", "currency" } ] }`
- **Do not return raw IPs** in the API response; return only coordinates (and optionally city/country).

---

## Frontend (neo-ui)

### 4. Map page and UX

- Add a **dedicated route** `/admin/map` (e.g. “Money flow” or “Money flow map”) rather than embedding a full map on the main dashboard. Add a nav entry under Compliance or Analytics in the admin sidebar and header.
- Use **Leaflet** (e.g. `react-leaflet`) or **Mapbox** for the map: markers for points and optional lines/arcs for flows.
- **Data:** Call `GET /admin/v1/analytics/money-flow-map` from a hook (e.g. `useAdminMoneyFlowMap(from, to)`) with date range and limit. Show points and flows with tooltips (amount, currency, type, date). Include date range and optionally type filter; cap results (e.g. 500) to keep the map performant.

---

## Implementation order

1. **Backend:** Geo package (MaxMind GeoLite2) + session-based `money-flow-map` endpoint.
2. **Frontend:** `/admin/map` page + map component (points first, then flow lines if the API returns flows).
3. **Backend:** IP-on-context middleware + set IP on transfer audit entries in the payment service.
4. **Backend:** Extend (or add) the money-flow-map data source to use transfer-audit-with-IP when available; keep session-based logic as fallback for older data.

---

## Compliance and privacy

- Document that client IP is stored in audit for transfer actions and used for aggregated geo visualization and fraud/risk.
- Do not return raw IPs from the map API; only coordinates and optionally city/country.
