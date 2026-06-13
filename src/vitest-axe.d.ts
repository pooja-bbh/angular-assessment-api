import type { AxeMatchers } from 'vitest-axe/matchers';

// Teach Vitest's `expect` about the axe matcher registered in test-setup.ts.
// `Assertion` extends this `Matchers` interface, so augmenting it here surfaces
// `toHaveNoViolations()` on `expect(...)`. Generic arity/default matches the
// library declaration so the augmentation merges cleanly.
declare module '@vitest/expect' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Matchers<T = any> extends AxeMatchers {}
}
