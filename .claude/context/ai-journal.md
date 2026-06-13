# AI Journal

A log of AI-assisted setup of the project's `.claude` context and rules.

## 2026-06-11

### Tech stack defined — `.claude/context/tech-stack.md`
Established the fixed technology baseline:
- Angular 22, standalone components only (no NgModules), Angular Material 22, Material 3 (M3) theming via `mat.define-theme()`.
- Signals (`signal`, `computed`, `effect`, `linkedSignal`) as the primary reactive primitive; no NgRx/Akita/third-party state libraries.
- `HttpClient` for all API calls with `httpResource()` where applicable; RxJS reserved for naturally event-driven streams; JSON Server as the local mock API.
- TypeScript strict mode enabled.

### Components, services & state rules — `.claude/rules/components-services-state.md`
- **Smart components**: own subtree state/signals, call services, pass data down via `input()`, handle `output()` events.
- **Dumb components**: receive data only via `input()` (never `@Input()`), communicate up only via `output()` (never `@Output()`), and never mutate inputs.
- **Services**: `providedIn: 'root'`, `inject()` over constructor injection, no imports from components, no DOM manipulation, no direct `console.*` (use `LoggingService`), one service per domain in its own file, no UI code/state, all HTTP via `HttpClient` (no `fetch`/XHR), don't swallow HTTP errors.
- **State**: signals over NgRx in all services; `aria` attributes on all UI elements.

### Storage rules — `.claude/rules/storage.md`
- All browser storage access centralised in `StorageService`; no direct `localStorage`/`sessionStorage`/`window.localStorage` calls elsewhere.
- Typed methods + known keys only; all keys defined in a `StorageKey` const object (no raw strings).
- Wrap `localStorage` calls in `try`/`catch` (private mode / quota errors); test `StorageService` in isolation with a mock `localStorage`.

### Styling rules — `.claude/rules/styling.md`
- Angular Material theming as the foundation; light + dark themes in `styles.scss` via `mat.define-theme()` applied through body classes; Material typography scale only.
- Design tokens as CSS custom properties in `:root` (with `body.theme-dark` overrides) — no hardcoded hex/pixel values in component stylesheets; reference token block captured.
- Component stylesheets scoped to layout/decoration only; `styles.scss` limited to theme, tokens, and global resets.
- CSS Grid/Flexbox for layout (never tables); dashboard usable ≥1024px; stats panel and filter bar stack vertically below 1024px via media queries.

### Logging rules — `.claude/rules/logging.md`
- All logging routed through `LoggingService`, the only class allowed to write to the console; all levels logged in development.
- Standard log format `[LEVEL] [timestamp] [context] message | data`; `HttpInterceptor` logs every outgoing request at `info` (method, URL, duration).
- Never log secrets (JWTs, auth headers, passwords), full response bodies in production, personal data beyond policy number, or full financial/premium amounts in production.

### Accessibility rules — `.claude/rules/accessibility.md`
- WCAG 2.1 AA from the start; every input labelled (`<label>`/`aria-label`/`aria-labelledby`, not placeholders).
- `aria-live="polite"` for loading, `role="alert"` for errors; sortable headers carry `aria-sort`, `MatTable` has a `<caption>`; `aria-busy="true"` while loading with focus moved to the first data row on completion.
- Contrast ≥4.5:1 (normal) / 3:1 (large) in both themes; colour never the sole indicator (pair with label/icon); axe-core via jasmine-axe in component specs plus manual VoiceOver/NVDA testing before submission.

## 2026-06-13

### Testing rules — `.claude/rules/testing.md`
- Every service, smart component, and critical dumb component must have a spec file; no failing tests may be submitted.
- All HTTP tests use `HttpClientTestingModule` + `HttpTestingController` (no real calls); always `httpMock.verify()` in `afterEach`.
- Every smart component tests all four load states: `loading` → skeleton, `success` → table, `error` → `ErrorStateComponent`, `success` + empty → `EmptyStateComponent`.
- Test signal values directly without subscribing.
- `StorageService` tested with a mock `localStorage` (never real storage), including the quota-exceeded path via a mock `DOMException` on write.
- Bulk flag action tests the optimistic update flow: signal updates immediately, API is called, signal reverts on API error.

### Internationalisation rules — `.claude/rules/i18n.md`
- App ships single-language for the assessment but the codebase must be i18n-ready (no later refactor); built on Angular's `@angular/localize`.
- Never hardcode user-visible strings in templates or TypeScript; never concatenate translated strings with `+` — use interpolation or ICU message format.
- `DatePipe` for all date formatting, `CurrencyPipe` for all currency; always show the currency code/symbol alongside amounts; never assume a single currency or locale number format.

### Error-handling rules — `.claude/rules/error-handling.md`
- Every async op explicitly handles loading/success/error; errors never silently fail; unhandled errors never crash the SPA silently.
- User-facing messages are specific and actionable (no generic "An error occurred"); HTTP status codes mapped to a defined user-friendly message table.
- Every recoverable error provides a retry mechanism; the parent smart component listens to the retry output and re-triggers the API call.
- Global `ErrorHandler` custom class catches unhandled errors, logs via `LoggingService`, and optionally shows a toast.
- Inline validation errors shown via Angular Material `mat-error`; never call the API with invalid filter state.

### Architecture rules — `.claude/rules/architecture.md`
- Single-page application (no SSR), startable with `npm start` / `ng serve`; well-engineered monolithic SPA — no micro-frontend unless all core requirements are complete.
- Project organised by feature, not type, using the exact `src/app/` structure (`core/`, `features/`, `shared/`, `layout/` + `environments/`); templates kept free of business logic.
- If MFE is attempted: Module Federation (Webpack) or Native Federation (esbuild) with clear host/remote boundaries for `policy-list`/`policy-stats` and a documented shared-dependency strategy — a complete monolith scores higher than an incomplete MFE.

### Coding-standards rules — `.claude/rules/coding-standards.md`
- Design principles: DRY (extract shared logic), SOLID (esp. SRP & DIP), self-documenting names, no magic numbers/strings, no god components.
- TypeScript: no `any` (use `unknown` + guards or interfaces), avoid non-null `!`, `const` by default / no `var`, `const enum` or string unions (no numeric enums), API shapes typed in `core/models/`.
- Naming: PascalCase `Component`/`Service` suffixes, PascalCase interfaces, camelCase signal inputs & internal signals, `$`-suffixed Observables, kebab-case files, BEM/prefixed kebab-case CSS classes.
- Imports per-component Material modules only (no barrels); no logic/formatting in templates; one component & one service per file; files under 300 lines; Prettier configured; max line length 120.

### Security rules — `.claude/rules/security.md`
- Production mindset: write secure code as if running against a real backend (mock API is no excuse); security evident in architecture/patterns, not comments.
- Auth: component layer never handles tokens directly; `401` → login redirect / session-expired message; never store JWTs in `localStorage`.
- Data storage: never cache financial response bodies, auth tokens, financial data, or PII in `localStorage`.
- Input: validate/sanitise filter inputs before query params; never expose stack traces in user-facing errors.
- Config/secrets: sensitive config (API base URL, feature flags) in `environment.ts`/`environment.prod.ts` only; never hardcode keys/URLs/secrets; never commit `.env`/credentials.
- Dependencies: no npm packages with known high/critical vulnerabilities. CORS: mock API on `localhost:3000` (not a concern locally); production would use a same-origin BFF — noted in architecture docs.

### Project guide — `CLAUDE.md`
- Created the root project guide with a mandatory directive to consult ALL `.claude/rules/` files before generating, modifying, or reviewing code, plus a linked index of all 11 rule files.

---

## Implementation — 2026-06-13

### Project scaffold — Angular 22 `policy-dashboard`
- Scaffolded via Angular CLI 22.0.1: `ng new policy-dashboard --routing --style=scss --ssr=false --strict`, then `ng add @angular/material@22` and dev deps `json-server` + `concurrently`.
- M3 theming in `styles.scss` via `mat.define-theme()` (light + dark applied through `body.theme-light`/`theme-dark`), overriding the CLI default `mat.theme()` to follow `styling.md`; design tokens + global resets added. Verified `mat.define-theme()` is still supported (non-deprecated) in Material 22.
- Added `mock` + `start:all` npm scripts; `environment.ts`/`environment.prod.ts` with `apiBaseUrl: http://localhost:3000` and production `fileReplacements` in `angular.json`; full feature-based folder tree (`core/`, `features/`, `shared/`, `layout/`).
- **v22 realities recorded:** scaffold is **zoneless** (no `zone.js`) and uses **Vitest**, not Karma/Jasmine — a conflict with `testing.md` (which assumes `HttpClientTestingModule`/`jasmine-axe`); to be resolved before the test phase. CLI's missing `"strict": true` was added manually; `provideAnimationsAsync()` dropped (Material 22 needs no `@angular/animations`).
- **Naming deviation:** kept `AppComponent`/`app.component.ts` (per `coding-standards.md`) over the CLI v22 default `App`/`app.ts`.
- **Dependency note:** the only `npm audit` highs are transitive `esbuild`/`vite` inside Angular's own `@angular/build` toolchain — dev-only, no fix published, not shipped to production.
- Relocated the whole scaffold into `angular-assessment-api/` (merged with existing `.claude/`, `.git/`, `CLAUDE.md`; `.gitignore` merged keeping the Angular CLI version + `.env`/`*.tsbuildinfo`).

### Core models — `src/app/core/models/`
- `policy.model.ts`: `Policy` (12 fields), string-union types `LineOfBusiness`/`PolicyStatus`/`PolicyRegion` (8 APAC regions)/`PolicyCurrency`, plus `PolicyFilter`, `PolicyPage`, `PolicyStats`, `DateRange`, `PolicySortColumn`, `SortDirection`. Premiums kept as `number` + separate `currency` (for `CurrencyPipe`); dates as ISO strings; all fields `readonly`.
- `app-error.model.ts`: `AppError { code, message, statusCode? }`. `load-state.model.ts`: `LoadState<T>` discriminated union (`idle`/`loading`/`success`/`error`) with a companion-object of constructors.
- `policy.constants.ts`: runtime allowlists mirroring the unions (extracted to keep DRY across service + store).

### Mock data — `db.json`
- Generated exactly 250 policy records (UUID ids, `POL-XXXXXX` numbers, realistic APAC names, region-matched currencies). Distributions verified: status 125/50/50/25, LOB ~even, all 8 regions, ~10% flagged, 15 expiring within 30 days of 2026-06-11.
- **Rule conflicts resolved:** region kept to the interface's 8 values (Philippines names allowed but not a region); the 15 expiring-soon records use 2025 effective dates (the "2022–2024 + 1-year" rule can't produce a 2026 expiry).

### Core services — `src/app/core/services/`
- `LoggingService`: sole console writer; `[LEVEL] [timestamp] [context] message | data` format; all levels in dev, warn/error only in prod.
- `StorageService`: centralised `localStorage` behind typed methods + `StorageKey` const; every call `try`/`catch`; non-sensitive values only.
- `ThemeService`: signal-based (`theme`/`isDark`), mutates `<body>` class via `Renderer2` (no direct DOM), persists preference, falls back to `prefers-color-scheme`.
- `PolicyService`: all HTTP via `HttpClient`; `getPolicies`/`getStats`/`setFlaggedForReview`/`bulkSetFlaggedForReview`; maps the json-server v1 envelope → `PolicyPage` contract; sanitises filter inputs before query params; HTTP status → user-friendly `AppError` table (`error-handling.md`); logs summaries only. **Chose Observables over `httpResource()`** for `HttpTestingController` testability.

### Filter store — `src/app/core/services/policy-filter.store.ts`
- Signal-only store (no RxJS): read-only signals `filters`/`page`/`pageSize`/`sortColumn`/`sortDirection`; computed `queryParams` + `hasActiveFilters`; mutation methods (`patchFilters`, `setSearch`, `clearFilters`, `setPage`, `setPageSize`, `setSort`, `reset`).
- Restores from / persists to `StorageService` (new `PolicyFilters` key), validating untrusted restored state against the allowlists; an `effect()` logs every change at debug. Filter changes reset to page 0.

### Auth interceptor — `src/app/core/interceptors/auth.interceptor.ts`
- Functional `HttpInterceptorFn` (no class). Attaches `Authorization: Bearer <token>` only to requests whose URL starts with `environment.apiBaseUrl` (token never leaked cross-origin); mock token is a commented stand-in (real token would come from an auth service, never `localStorage`).
- Logs outgoing request (method + URL) at `info`, non-2xx at `warn`, network errors (status 0) at `error` — never the token/headers; rethrows via `throwError(() => error)` (never swallows). Registered with `provideHttpClient(withFetch(), withInterceptors([authInterceptor]))`.
- **Duration-logging gap:** logging.md also wants request duration in the info log; that belongs in a dedicated response-timing interceptor (still outstanding), not the auth interceptor.

### Shared dumb components — `src/app/shared/components/`
- `StatusBadge`, `ExpiryIndicator`, `SkeletonLoader`, `EmptyState`, `ErrorState` — all standalone, OnPush, **zero service deps**, `input()`/`output()` only (no `@Input`/`@Output`/`EventEmitter`), tokens-only styling.
- Accessibility baked in: status badge keeps colour as a supplementary dot + always-visible label (`role="img"` + `aria-label`); expiry indicator icon `role="img"` + `aria-label` + tooltip; skeleton `role="status"`/`aria-busy`; empty `role="status"`; error `role="alert"`; decorative icons `aria-hidden`; skeleton respects `prefers-reduced-motion`.
- Each has a spec covering inputs/outputs/a11y. Button labels hardcoded ("Clear filters"/"Retry") to keep input/output lists exactly as specced.

### Test runner — Vitest + `vitest-axe` (resolves the pending runner conflict)
- Locked the runner to **Vitest** (Angular 22's default for `@angular/build:unit-test`) explicitly in `angular.json` (`runner: "vitest"`, `setupFiles: ["src/test-setup.ts"]`). No Karma/Jasmine anywhere.
- Adopted **`vitest-axe`** as the jasmine-axe replacement: `src/test-setup.ts` registers `toHaveNoViolations`; `src/vitest-axe.d.ts` augments `@vitest/expect`'s `Matchers`; shared `checkA11y` helper (`src/testing/a11y.ts`) scopes axe to WCAG 2.1 A/AA. Added axe assertions to all five component specs.
- Updated `testing.md` (Vitest runner, `provideHttpClientTesting()` over `HttpClientTestingModule`, Vitest `vi.*` spies) and `accessibility.md` (vitest-axe; note that jsdom skips colour-contrast — verify manually/in-browser).
- Full suite green: **23 tests / 6 files**.

### Outstanding / next
- HTTP **logging/timing interceptor** (request duration at `info` per logging.md) and global **`ErrorHandler`** not yet created.
- `features/policy-list`, `policy-stats`, `bulk-actions`, and `layout/` shell not yet built.
- No specs yet for the models/services/store (only the shared components are tested); `StorageService` quota-path and `PolicyService` HTTP/optimistic-update tests still owed per testing.md.
