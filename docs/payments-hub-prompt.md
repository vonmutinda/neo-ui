# Payments Hub: Implementation Prompt

Use this document as the spec for introducing a **Payments Hub** in the main app nav so users can see and manage **payment requests** (sent and received) after "Requests" was removed from the nav.

---

## Goal

- Add a **Payments Hub** entry to the main dashboard navigation.
- The Payments Hub is the place where users view **requests they’ve sent** and **requests they’ve received**, and can act on them (pay, decline, remind, cancel).
- Reuse existing payment-request APIs and UI; no backend changes required.

---

## Context

- **Current state:** The app has a full payment-requests flow at `/requests` (list with Received/Sent tabs, `/requests/new`, `/requests/new/split`, `/requests/[id]`), but there is **no nav link** to it. `NAV_ITEMS` in `src/lib/nav-items.ts` does not include Requests. Users can only reach requests via QuickActions (“Request” → create flow) or deep links.
- **Existing hooks:** `useReceivedRequests`, `useSentRequests`, `usePendingRequestCount`, `usePayRequest`, `useDeclineRequest`, `useCancelRequest`, `useRemindRequest` in `src/hooks/use-payment-requests.ts`. API: `GET /v1/payment-requests/sent`, `GET /v1/payment-requests/received`, etc.
- **Desired state:** A visible **Payments Hub** in the main nav that takes users to a single view where they can see both sent and received requests and perform actions.

---

## Requirements

### 1. Nav entry

- Add a **Payments Hub** item to the main dashboard nav (`NAV_ITEMS` in `src/lib/nav-items.ts`).
- Choose an appropriate icon (e.g. `HandCoins`, `Wallet`, `CircleDollarSign`, or `Inbox`).
- Link to the route that hosts the Payments Hub view (see below). Prefer a clear path such as `/payments-hub` or keep `/requests` and treat it as the Payments Hub (nav label only changes).

### 2. Payments Hub page content

- The Payments Hub **must** show:
  - **Requests received:** List of payment requests the user has received (with Pay / Decline for pending). Reuse the “Received” list and row component from `src/app/(dashboard)/requests/page.tsx`.
  - **Requests sent:** List of payment requests the user has sent (with Remind / Cancel for pending). Reuse the “Sent” list and row component from the same page.
- Use **tabs or segments** (e.g. “Received” and “Sent”) so the user can switch between the two. Optionally show a **pending count** badge (e.g. on “Received”) using `usePendingRequestCount()`.
- Provide a clear **primary action** to create a new request (e.g. “Request money” or “New request”) that links to `/requests/new` (and optionally to `/requests/new/split` for split requests).
- Reuse existing hooks and components; avoid duplicating logic.

### 3. Route strategy (choose one)

- **Option A:** Add nav item **Payments Hub** → href **`/requests`**. Keep the existing route; only add the nav entry and optionally rename the page title/heading to “Payments Hub” so the nav label and page title align. Easiest and preserves all existing `/requests/*` URLs.
- **Option B:** Add route **`/payments-hub`** that renders the same Requests list UI (Received/Sent tabs, actions, link to create). Redirect or rewrite `/requests` to `/payments-hub` if you want a single canonical URL; update internal links (e.g. from QuickActions, recipients, request detail back-link) to point to `/payments-hub` where appropriate.

### 4. Cross-links and tests

- **QuickActions:** The “Request” quick action currently links to `/requests/new`. Keep it or point it to “Payments Hub” for “see requests” and keep a separate “Request money” that goes to `/requests/new`; decide per product preference.
- **Request detail back-link:** The request detail page (`/requests/[id]`) should link back to the Payments Hub (e.g. “Back to Payments Hub” or “Back to requests”) so users return to the list.
- **Nav test:** If there is a test that asserts “Requests is not in the nav”, update it to allow “Payments Hub” (or the chosen label) and assert that the Payments Hub entry exists and links to the correct path.

---

## Implementation summary

1. Add **Payments Hub** to `NAV_ITEMS` (icon + label + href).
2. Ensure the target page (either existing `/requests` or new `/payments-hub`) shows Received and Sent requests with tabs/segments, pending count where useful, and a primary “Request money” / “New request” action.
3. Align page title/heading with “Payments Hub” if the nav label is “Payments Hub”.
4. Update any tests that depend on the nav or on “Requests” not being present.
5. Optionally add a short in-app hint (e.g. on Home or empty state) that “Payment requests live in Payments Hub”.

---

## Out of scope

- Backend API changes (existing payment-requests endpoints are sufficient).
- Renaming or changing the request-detail or create-request flows beyond linking them from the Payments Hub.
