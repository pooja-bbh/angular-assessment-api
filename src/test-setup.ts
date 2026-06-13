import * as axeMatchers from 'vitest-axe/matchers';
import { expect } from 'vitest';

// Register the axe-core accessibility matcher (`toHaveNoViolations`) globally,
// the Vitest equivalent of jasmine-axe (accessibility.md).
expect.extend(axeMatchers);
