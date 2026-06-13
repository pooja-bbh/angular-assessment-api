# Security Rules

## Production Mindset
- Write all code as if it will run in production against a real backend — the mock API is for local development only, not an excuse for insecure patterns.
- Security posture must be evident in the architecture and code patterns, not just in comments.

## Authentication & Tokens
- The component layer must never handle auth tokens directly.
- If a `401` response is received, redirect the user to a login page or show an appropriate session-expired message.
- Never store JWT tokens in `localStorage` in any code path.

## Data Storage
- Never cache full API response bodies containing financial data in `localStorage`.
- Never store auth tokens, financial data, or personally identifiable information in `localStorage`.

## Input Handling
- Validate and sanitise all filter inputs before including them in API query params.
- Never expose internal error stack traces in user-facing error messages.

## Configuration & Secrets
- Store all sensitive configuration — API base URL, feature flags — in `environment.ts` and `environment.prod.ts` only.
- Never hardcode API keys, base URLs, or secrets in component or service code.
- Never commit `.env` files or real credentials to the repository.

## Dependencies
- Never introduce npm dependencies with known high or critical vulnerabilities.

## CORS & Deployment
- The mock API runs on `localhost:3000` — CORS is not a concern for local development. In a production architecture, API calls would go through a BFF on the same origin — note this in architecture documentation.
