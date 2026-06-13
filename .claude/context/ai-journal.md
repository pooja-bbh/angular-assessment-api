
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

### Filter bar — `src/app/features/policy-list/policy-filter-bar/`
- Dumb component: `currentFilters` input; `filterChange` (`Partial<PolicyFilter>`) + `resetFilters` outputs (via `output()`, not `EventEmitter`). Status multi-select, single-selects for LOB/Region (with "All" option), `MatDateRangePicker`, and a debounced search.
- **Search debounce**: `valueChanges.pipe(debounceTime(300), distinctUntilChanged())` — never per-keystroke; selects emit immediately. The user flagged this explicitly (saved as a project memory).
- A reactive `FormGroup` is mirrored from the input via an `effect()` with `{ emitEvent: false }` (no feedback loop). `mat-label` on every field (never placeholder-only); `i18n`/`i18n-placeholder`/`i18n-aria-label` on all static text; installed **`@angular/localize`** (polyfill wired) so the markers compile. Clear button gated by `@if (hasActiveFilters())`. Stacks below 1024px.
- `filterForm` is public so the spec can drive controls; spec proves debounce timing + emissions.

### Model change — `PolicyFilter.status` is now `readonly PolicyStatus[]`
- Required so the multi-select status can emit into `Partial<PolicyFilter>`. Rippled through `PolicyService.buildParams` (one repeated `status` query param per value → json-server OR) and `PolicyFilterStore` (`hasActiveFilters` → `status?.length`, restore-validation filters the array). LOB/Region stay single.

### Policy table (smart) — `src/app/features/policy-list/policy-table/`
- Standalone, OnPush. Injects `PolicyService`, `PolicyFilterStore`, `Router`, `ActivatedRoute`, `MatSnackBar`.
- **Reactive load**: `toObservable(filterStore.queryParams)` (merged with a `reload$` retry Subject) → `switchMap(getPolicies)` → `map`/`startWith(loading)`/`catchError` → `toSignal`. Exposed `loadState` is a **`linkedSignal`** over that server state — read-only from the server but `.set()`-able for optimistic updates and auto-resetting on re-fetch.
- Template uses `@switch`/`@case`/`@if`/`@else` only: skeleton (loading), `ErrorStateComponent` with `(retry)` → `reload$`, `EmptyStateComponent` (success+empty), `MatTable` (success+rows). `MatTable`'s `*matRowDef` is its required API, not legacy `*ngFor`.
- `MatSort` on policyNumber/status/premiumAmount/expiryDate → `setSort()` (mat-sort-header supplies `aria-sort`); `MatPaginator` bound to store page/pageSize; visually-hidden `<caption>`; signal-based bulk selection (master + per-row, `selectedIds` signal — `SelectionModel.selected.length` isn't OnPush-reactive).
- **Optimistic flag**: `flagPolicies()` sets the signal immediately, calls `PolicyService.flagForReview()`, reverts + opens a snackbar on error. URL sync via `effect()` (page/size/sort/dir); `initFromUrl()` seeds the store from the route snapshot before the pipeline subscribes (single initial fetch).
- **Service rename**: `bulkSetFlaggedForReview` → **`flagForReview`** (handles single or many ids; supersedes the earlier journal mention).

### Bulk action toolbar — `src/app/features/bulk-actions/bulk-action-toolbar/`
- Dumb: `selectedCount` input; `flagForReview` + `clearSelection` outputs. ICU plural count (`{{ }}` interpolation in the case — `#` rendered literally, the spec caught it); `role="region"` + `aria-live`. Spec covers count + both outputs.
- Full suite green: **40 tests / 9 files**.

### Stats panel (smart) — `src/app/features/policy-stats/policy-stats.component.ts`
- Standalone, OnPush; injects `PolicyService` + `PolicyFilterStore`. **`effect()`-driven re-fetch** (per user steer): the effect reads `filterStore.queryParams()` then calls `getStats()`, writing a writable `loadState` signal; prior request unsubscribed each run (race-safe) and on `DestroyRef`.
- Responsive CSS-grid of `MatCard`s: 4 status counts, 4 LOB premium totals (`CurrencyPipe`), and an "Expiring within 30 days" card highlighted with `var(--color-warning)` when count > 0. Skeleton cards while loading; small inline `role="alert"` error that does **not** render the grid (never blocks the table).
- Every card has a descriptive `$localize` `aria-label` (metric + value). **Display currency = USD** for LOB totals — `PolicyStats.totalPremiumByLob` is a single number aggregated across currencies (BFF limitation already noted); stats are portfolio-wide, re-fetched on filter change but not yet narrowed by filter.

### Layout & wiring — `header/`, `dashboard/`, `app.*`
- `HeaderComponent` (layout): `mat-toolbar` with "Chubb APAC | Policy Dashboard" + `mat-icon-button` theme toggle calling `ThemeService.toggleTheme()`; dynamic `aria-label` (computed) states current theme + the switch action; icon reflects target theme.
- `DashboardComponent` (smart, `features/policy-list/dashboard/`): composes filter bar + stats + table; wires `(filterChange)` → `patchFilters`, `(resetFilters)` → `clearFilters`, and feeds `[currentFilters]="filterStore.queryParams()"`. (`Partial<PolicyFilter>` is assignable to `patchFilters`' `Partial<PolicyFilterCriteria>` — superset → subset param.)
- `AppComponent`: renders `<app-header>` + `<router-outlet>`; an `effect()` watching `ThemeService.theme` reflects the class onto the **host** (ThemeService still owns the `<body>` class that M3/tokens hang off — host class is an extra hook; slight redundancy flagged).
- `app.routes.ts`: single lazy route `'' → DashboardComponent`. `app.config.ts`: `provideRouter`, `provideHttpClient(withInterceptors([authInterceptor]))`, `provideAnimations`, `LOCALE_ID: 'en-SG'` (+ `registerLocaleData(en-SG)`).
- **v22 deprecations handled**: dropped `withFetch()` (deprecated — fetch is now default); kept `provideAnimations()` despite its deprecation (both it and `provideAnimationsAsync` are deprecated in v22, removal intended v23 in favour of template `animate.enter/leave` — no non-deprecated DI provider exists). Installed `@angular/animations@22`. Renamed `ThemeService.toggle` → `toggleTheme`.
- **Bug fixed**: `ThemeService.resolveInitialTheme` crashed under jsdom (`matchMedia is not a function`); now guards `typeof view.matchMedia === 'function'`.
- Build warning: initial bundle 572 kB > 500 kB budget (eager animations + Material in the shell) — non-fatal; bump the budget or lean on the lazy dashboard route if it matters.
- Full suite green: **45 tests / 10 files**.

### Styling setup — `styles.scss` + component stylesheets
- `styles.scss` finalised: M3 `mat.define-theme()` light/dark via `body.theme-light`/`theme-dark`; full styling.md token block in `:root` with dark overrides; global resets now include universal `box-sizing: border-box` + `body { margin: 0 }`.
- **Primary**: Material theme uses `mat.$azure-palette` (professional blue ≈ #1565C0) since M3 needs a generated tonal palette; the exact `#1565C0` is the `--color-primary` token. Pixel-exact M3 primary → `ng generate @angular/material:m3-theme`.
- **Added `--color-on-success`/`-on-error`/`-on-warning` tokens** (theme-independent) so badges pair each semantic fill with AA-contrast text without hardcoding hex. `--color-on-warning: #000000` because white on `#e65100` is only ~3.4:1 (fails AA); black is ~6.2:1.
- `StatusBadgeComponent` + `SkeletonLoaderComponent` converted from inline `styles` to `styleUrl` `.scss` files. **Badge redesigned**: semantic-colour fill + contrasting text (dropped the earlier neutral-pill + coloured-dot look); kept the `__label` span the spec asserts. Skeleton rows now ≈ a 52px Material data row (`min-height: 3.25rem`), pulse on `var(--color-surface-variant)`.
- Full suite still green: **45 tests / 10 files**.

### Service & store specs — `core/services/*.spec.ts`
- Reviewed all 10 existing specs; the two priority component specs were already complete (`error-state`: inputs/retry/`role="alert"`/axe; `policy-table`: all four load states + retry + optimistic-flag→revert). Created the three missing ones.
- `storage.service.spec.ts`: mocks `localStorage` via `vi.stubGlobal` (never real storage). Covers set/get round-trip, missing key, malformed JSON → null + warn, **quota-exceeded `DOMException` on write → false + warn**, remove, and remove-throws swallowed + warn.
- `policy.service.spec.ts`: `provideHttpClient()` + `provideHttpClientTesting()` + `HttpTestingController`, `httpMock.verify()` in `afterEach`. Covers `getPolicies` success (envelope → `PolicyPage`), **4xx → `BAD_REQUEST`**, **network error (status 0) → `NETWORK`**, and `flagForReview` (PATCH per id, body `{ flaggedForReview: true }`, ordered results).
- `policy-filter.store.spec.ts`: signals read directly. Covers defaults, `patchFilters`/`setSearch`/`clearFilters`/`setPage` (clamp)/`setPageSize`/`setSort`/`reset`, the `queryParams` + `hasActiveFilters` computeds, and `initFromUrl` (valid hydration incl. dropping a bogus status; invalid-scalar fallback).
- Full suite green: **66 tests / 13 files**.

### Runtime fixes — mock API + filter feedback loop
- **"Can't reach the server" on load** was the mock API not running (`ng serve` alone): json-server was down (`curl` exit 7). Started it; verified `db.json` serves correctly with CORS `*` and that the auth-interceptor's `Authorization` header passes preflight. Documented `npm run start:all` as the correct workflow.
- **Stuck-on-loading after any filter/search** was an infinite feedback loop: `DashboardComponent` feeds `queryParams()` back into the filter bar's `[currentFilters]`, whose `effect()` mirrors it via `setValue({ emitEvent: false })` — but **Material's date-range inputs re-emit `valueChanges` anyway**, so the bar emitted `filterChange` back → store re-patched → `queryParams` new object → re-fetch forever (table + stats both perpetually loading).
- Fix in `PolicyFilterBarComponent`: `emitDateRange()` now **ignores echoes** that equal the current input (only genuine user changes emit), plus `fromIsoDate()` parses ISO dates as **local** midnight so they round-trip through `toIsoDate()` (a bare `new Date('yyyy-MM-dd')` is UTC and would shift the day, defeating the guard). Added `policy-filter-bar.loop.spec.ts` regression test (setting `currentFilters` must emit nothing).
- Root cause the earlier unit tests missed: they only covered the *initial* load with a mocked service, never the input→output→input round-trip the live dashboard exercises.

### Codebase review & cleanup — build/lint/test + comment removal
- `ng build`: no TS/template errors. `ng lint`: **wasn't configured** — added `angular-eslint` (`ng add`), then fixed 2 errors in `src/vitest-axe.d.ts` (empty interface + unused generic) by declaring `toHaveNoViolations(): T`; added a `**/*.d.ts` override disabling `no-explicit-any` (the generic default must stay `T = any` to merge with `@vitest/expect`'s `Matchers<T = any>`); kept it a module via `export {}` (dropping the import had made it an ambient redeclaration that broke `expect.extend`). `ng test`: 0 failing.
- **Removed all comments** from ~28 source files (`core/`, `shared/`, `features/`, `layout/`, root configs, `styles.scss`) via 3 parallel agents, then re-verified lint+build+test. Preserved the `/// <reference types="@angular/localize" />` compiler directive in `main.ts`, all string literals/URLs, and `i18n`/`aria-*`/`mat-*` template attributes.
- Raised the `initial` bundle budget to 1 MB/2 MB (eager animations + Material in the shell) → **fully clean build** (no warnings).
- Final state: clean build, clean lint, **67 tests / 14 files** green, app running with data.

### Outstanding / next
- HTTP **logging/timing interceptor** (request duration at `info` per logging.md) and global **`ErrorHandler`** not yet created.
- Specs still owed per testing.md: `ThemeService`, `HeaderComponent`, `DashboardComponent` (a `DashboardComponent` integration spec would have caught the filter loop).
- Stats not filter-scoped (`getStats()` ignores params); decide whether to thread the filter in.

---

## Response classification — 2026-06-13

How the user responded to each AI deliverable this session. (**Accepted** = used as delivered; **Challenged** = accepted only after the user pushed back on the approach; **Rejected** = the tool call was declined and redone.)

### Accepted
- Angular 22 scaffold; relocation into `angular-assessment-api/`.
- Core models + `policy.constants.ts`; `db.json` (250 records).
- Core services (Logging, Storage, Theme, Policy); `policy-filter.store.ts`.
- `auth.interceptor.ts`; five shared dumb components + specs.
- Switch to **Vitest** + `vitest-axe`.
- `policy-table` (smart) + `bulk-action-toolbar` + specs.
- Layout & wiring (header, dashboard, `app.*`, routes, config).
- Styling setup (`styles.scss` + status-badge/skeleton `.scss` files).
- Service & store specs (`storage.service`, `policy.service`, `policy-filter.store`).
- Runtime fixes (mock-API diagnosis, filter feedback-loop fix) and codebase review/cleanup (ESLint setup, comment removal, budget bump).
- All ai-journal update requests.

### Challenged (revised after user pushback, not a hard rejection)
- **Filter bar — debounce**: user insisted "search fires on every keystroke → force `debounceTime(300)` + `distinctUntilChanged()`". Code already debounced; re-affirmed and made unmistakable. Saved as a project memory.
- **Stats panel — reactivity**: user directed "add `effect()` to re-fetch whenever `queryParams` changes" instead of the `toObservable→switchMap→toSignal` pipeline. Rebuilt with an `effect()`-driven fetch.

### Rejected (tool call declined, then redone)
- `policy-filter-bar.component.ts` write — rejected (and an earlier interrupt), then re-submitted with the explicit debounce. 
- `policy-stats.component.ts` write — rejected, then re-submitted with the `effect()`-based fetch.

### Self-surfaced conflicts (decisions I flagged for the user, per CLAUDE.md)
- `mat.define-theme()` vs Material 22's `mat.theme()`; `AppComponent` naming vs CLI default; Vitest vs the testing.md `jasmine-axe` assumption; multi-select status forcing `PolicyFilter.status` → array; 8 APAC regions vs the Philippines-name list; expiring-soon dates vs the 2022–2024 rule; `provideAnimations` deprecation; host-vs-body theme class.
- Styling: M3 needing a generated palette vs the requested `#1565C0` hex (used azure palette + token); badge contrast needing new `--color-on-warning` (black, not white) because styling.md has no on-* tokens; coloured-fill badge redesign superseding the earlier neutral-pill + dot.
