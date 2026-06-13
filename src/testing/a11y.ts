import { configureAxe } from 'vitest-axe';

export const checkA11y = configureAxe({
  runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
});
