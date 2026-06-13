import { configureAxe } from 'vitest-axe';

/**
 * axe-core runner scoped to WCAG 2.1 A/AA — the conformance target in
 * accessibility.md. Best-practice rules (e.g. landmark/region) are excluded so
 * component-level specs assert real AA violations rather than page-structure noise.
 *
 * Usage: `expect(await checkA11y(fixture.nativeElement)).toHaveNoViolations();`
 */
export const checkA11y = configureAxe({
  runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
});
