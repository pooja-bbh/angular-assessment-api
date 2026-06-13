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
