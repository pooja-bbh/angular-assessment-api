# Testing Rules

## Runner
- The test runner is **Vitest**, via the Angular `@angular/build:unit-test` builder (`runner: "vitest"`) — not Karma/Jasmine. Tests run in a `jsdom` environment.
- Use Vitest globals (`describe`/`it`/`expect`/`beforeEach`) and the Vitest API (`vi.fn()`, `vi.spyOn()`) — never Jasmine APIs (`jasmine.createSpy`, `spyOn` from Jasmine).
- Global test setup lives in `src/test-setup.ts` (registered via the builder's `setupFiles`).

## Coverage
- Every service, smart component, and critical dumb component must have a spec file — tests are not optional, and no failing tests may be submitted.

## HTTP
- Use `provideHttpClientTesting()` (with `provideHttpClient()`) and `HttpTestingController` for all HTTP tests — never make real HTTP calls in unit tests. (`HttpClientTestingModule` is the legacy module-based equivalent; prefer the standalone provider.)
- Always call `httpMock.verify()` in `afterEach` to catch unexpected requests.

## Smart Component Load States
- Test all four load states on every smart component:
  - `'loading'` renders the skeleton.
  - `'success'` renders the table.
  - `'error'` renders `ErrorStateComponent`.
  - `'success'` with empty data renders `EmptyStateComponent`.

## Signals
- Test signal values directly without subscribing.

## Storage
- Test `StorageService` with a mock `localStorage` — never use the real browser storage in unit tests.
- Specifically test the quota-exceeded path by having the mock throw a `DOMException` on write.

## Optimistic Updates
- Test the optimistic update flow on the bulk flag action — verify the signal updates immediately, the API is called, and the signal reverts correctly when the API returns an error.
