# Requirements — Policy List Component

**Feature:** Policy Overview Dashboard — Angular Frontend (Policy List Component)
---

## User Story

As an APAC operations user,  
I want to see a paginated list of my policies on the dashboard,  
So that I can quickly scan status, premium, and expiry across my portfolio.

---

## Background

The BFF endpoint is ready at `GET /api/policies?page=0&size=20`. Response shape is confirmed (see API contract on Confluence). This ticket covers the Angular component that consumes that endpoint and renders the policy list with server-side pagination.

Auth is handled externally — a JWT token is attached by an existing `HttpInterceptor`; the component does not handle auth.

---

## Technology Stack

| Concern | Choice |
|---|---|
| Framework | Angular 17 |
| UI Library | Angular Material |
| Async | RxJS, HttpClient |
| State Management | Signals (no NgRx for this component) |

---

## API Contract

**Endpoint:** `GET /api/policies?page=0&size=20`

**Response shape:**

{
  "content": [
    {
      "policyNumber": "POL-2024-SG-00123",
      "holderName": "Tan Wei Ming",
      "region": "Singapore",
      "status": "Active",
      "premiumFormatted": "SGD 1,200.00",
      "durationDays": 365,
      "isExpiringSoon": false
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 84,
  "totalPages": 5
}
---

## Functional Requirements

### 1. Policy List Render

- On component load, call `GET /api/policies?page=0&size=20`
- Render a table with columns: **Policy Number** | **Holder** | **Region** | **Status** | **Premium** | **Expiring Soon**

### 2. Pagination

- Show Angular Material paginator below the table when `totalPages > 1`
- Clicking next/previous calls the API with the updated `page` param
- Table updates without a full page reload

### 3. Expiry Indicator

- When `isExpiringSoon` is `true`, display a visible warning indicator (icon or badge) on that row
- No indicator shown when `isExpiringSoon` is `false`

### 4. Loading State

- While the API call is in flight, show a loading spinner
- Table must not be visible until data arrives

### 5. Error State

- On a non-2xx API response, hide the table and display a meaningful error message
- Provide the user with a way to retry (implementation approach — spinner vs. auto-retry — left to developer discretion)

### 6. Empty State

- When `totalElements === 0`, show a **"No policies found"** message
- Paginator must be hidden in this state

---

## Non-Functional Requirements

### Accessibility *(Required)*

- Sortable columns must have `aria-label` attributes on the table headers
- Loading and error states must be announced to screen readers (e.g., via `aria-live` regions)

---

## Acceptance Criteria

| # | Criterion | Given | When / Then |
|---|---|---|---|
| AC1 | Policy list renders | User lands on the dashboard | Component calls `GET /api/policies?page=0&size=20` and renders the table with all 6 columns |
| AC2 | Pagination works | `totalPages > 1` | Paginator is shown; next/previous updates the `page` param and refreshes the table without a full reload |
| AC3 | Expiry indicator | `isExpiringSoon: true` on a record | That row shows a warning icon/badge; rows with `false` show nothing |
| AC4 | Loading state | API call is in flight | Spinner is visible; table is hidden |
| AC5 | Error state | API returns non-2xx | Error message shown, table hidden, retry option available |
| AC6 | Empty state | `totalElements: 0` | "No policies found" message shown; paginator hidden |
| AC7 | Accessibility | — | Sortable columns have `aria-label`; loading and error states are announced to screen readers |
