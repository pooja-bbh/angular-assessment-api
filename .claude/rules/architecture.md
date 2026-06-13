# Architecture Rules

## Application Type
- Build a single-page application (SPA) — server-side rendering is not required.
- The application must be startable locally with `npm start` or `ng serve`.
- Structure the project as a well-engineered monolithic SPA — do not attempt a micro-frontend architecture unless all core requirements are fully complete.

## Folder Structure
- Organise the project by feature, not by type. Use this exact folder structure:

```
src/app/
  core/                  → singleton services, interceptors — imported once
    interceptors/
    services/            → PolicyService, StorageService, ThemeService, LoggingService
    models/              → shared TypeScript interfaces and types
  features/
    policy-list/         → policy table, filters, pagination
    policy-stats/        → summary statistics panel
    bulk-actions/        → bulk action toolbar
  shared/                → reusable dumb components, pipes, directives
    components/          → StatusBadge, ExpiryIndicator, SkeletonLoader, EmptyState, ErrorState
    pipes/
    directives/
  layout/                → shell, header, theme toggle
environments/
```

## Templates
- Keep all component templates free of business logic — move logic to the component class or a service.

## Micro-Frontend (only if monolith is complete)
- A complete monolith scores higher than an incomplete MFE.
- If implementing a micro-frontend: use Module Federation (Webpack) or Native Federation (esbuild), define clear host/remote boundaries for `policy-list` and `policy-stats`, and document the shared-dependency strategy.
