# Storage Rules

- All browser storage access must be centralised in `StorageService`.
- No component, service, or store may call `localStorage`, `sessionStorage`, or `window.localStorage` directly.
- Storage must be properly encapsulated — the rest of the application interacts only with typed methods and known keys.
- All storage keys must be defined in the `StorageKey` const object — no raw strings anywhere else in the codebase.
- Wrap all `localStorage` calls in `try`/`catch` — `localStorage` can throw in private browsing mode or when the storage quota is exceeded.
- `StorageService` must be tested in isolation with a mock `localStorage`.
