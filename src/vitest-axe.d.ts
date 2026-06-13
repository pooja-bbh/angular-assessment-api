export {};

declare module '@vitest/expect' {
  interface Matchers<T = any> {
    toHaveNoViolations: () => T;
  }
}
