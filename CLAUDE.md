# Angular Assessment API — Project Guide

## ⚠️ Mandatory: Consult the Rule Files Before Generating Code

**Whenever you generate, modify, or review code in this project, you MUST first refer to ALL of the rule files in [.claude/rules/](.claude/rules/).** These rules are not optional — every piece of code produced must comply with all of them. When rules appear to conflict, surface the conflict rather than silently picking one.

### Rule Files

- [architecture.md](.claude/rules/architecture.md) — SPA type, feature-based folder structure, monolith vs. micro-frontend.
- [coding-standards.md](.claude/rules/coding-standards.md) — DRY/SOLID, TypeScript rules, naming conventions, file organisation, formatting.
- [components-services-state.md](.claude/rules/components-services-state.md) — smart vs. dumb components, service rules, signal-based state.
- [error-handling.md](.claude/rules/error-handling.md) — loading/success/error states, user-facing messages, retry, global `ErrorHandler`.
- [accessibility.md](.claude/rules/accessibility.md) — WCAG 2.1 AA, ARIA, contrast, axe-core testing.
- [styling.md](.claude/rules/styling.md) — Angular Material theming, design tokens, layout & responsiveness.
- [storage.md](.claude/rules/storage.md) — centralised `StorageService`, typed keys, `try`/`catch`.
- [logging.md](.claude/rules/logging.md) — `LoggingService` as the only console writer, sensitive-data rules.
- [security.md](.claude/rules/security.md) — production mindset, auth tokens, data storage, secrets, dependencies.
- [i18n.md](.claude/rules/i18n.md) — i18n-readiness, `@angular/localize`, date & currency formatting.
- [testing.md](.claude/rules/testing.md) — spec coverage, `HttpClientTestingModule`, load-state and signal testing.
