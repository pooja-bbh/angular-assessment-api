# Coding Standards Rules

## Design Principles
- Apply DRY — extract any shared logic into services, pipes, or utility functions instead of duplicating it.
- Apply SOLID principles throughout, especially Single Responsibility and Dependency Inversion.
- Write clean, self-documenting code — variable and function names must explain intent without needing a comment.
- Avoid magic numbers, magic strings, and ambiguous abbreviations.
- Never write god components — a component that does too many things must be split.

## TypeScript
- Never use the `any` type. Use `unknown` and narrow with type guards, or define a proper interface.
- Never use non-null assertions (`!`) unless absolutely unavoidable.
- Use `const` by default; use `let` only when reassignment is necessary. Never use `var`.
- Use `const enum` or string union types for all enums. Never use numeric enums.
- Store all API response shapes as typed interfaces in `core/models/`.

## Naming Conventions
- Name components in PascalCase with a `Component` suffix — for example `PolicyTableComponent`.
- Name services in PascalCase with a `Service` suffix — for example `PolicyService`.
- Name interfaces in PascalCase — for example `Policy` or `PolicyFilter`.
- Name signal inputs as camelCase nouns — for example `status = input<PolicyStatus>()`.
- Name internal signals as camelCase nouns — for example `policies` or `activeFilters`.
- Name Observables in camelCase with a `$` suffix — for example `policies$` or `filterChange$`.
- Name all files in kebab-case — for example `policy-table.component.ts`.
- Name CSS classes in BEM or kebab-case with a component prefix — for example `policy-table__row--expiring`.

## Imports & Modules
- Import only the specific Angular Material modules a component uses in its own `imports: []` array — never import a barrel re-export module.

## Templates
- Never put conditional logic, calculations, or formatting in a template — move it to the component class or a pipe.

## File Organisation
- Define only one component per file.
- Define only one service per file.
- Keep every file under 300 lines — split it if it exceeds this limit.

## Formatting
- Configure Prettier for consistent code formatting across the project.
- Keep line length at a maximum of 120 characters.
