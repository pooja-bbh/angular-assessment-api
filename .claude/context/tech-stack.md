# Tech Stack

## Framework & Components
- Use Angular 22 — this is the project's fixed version.
- Use standalone components exclusively — NgModules are fully deprecated in Angular 22; do not generate or reference them.
- Use Angular Material 22 for all UI components (tables, paginators, form fields, dialogs, snack bars, icons).
- Use Material 3 (M3) theming API — `mat.define-theme()` — not the legacy M2 `mat.define-light-theme()` / `mat.define-dark-theme()` APIs.

## State & Reactivity
- Use Angular Signals as the primary reactive primitive — `signal()`, `computed()`, `effect()`, `linkedSignal()` from `@angular/core`.
- Do not introduce NgRx, Akita, or any third-party state library unless explicitly asked.
- Use RxJS only for streams that are naturally event-driven (e.g., debounced search input).

## Data Fetching
- Use Angular's `HttpClient` for all API calls — use the `httpResource()` API for declarative resource-based data fetching where applicable.
- Use JSON Server (`json-server`) as the local mock API.

## Tooling
- Strict mode enabled in `tsconfig.json` (`"strict": true`).
