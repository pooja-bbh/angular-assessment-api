# Accessibility Rules

- All UI must conform to WCAG 2.1 Level AA — build it in from the start, never retrofit it.
- Every form input must have an associated `<label>`, `aria-label`, or `aria-labelledby` — never rely on placeholder text alone.
- Loading states must use `aria-live="polite"` and error states must use `role="alert"` so screen readers announce both automatically.
- Every sortable table column header must carry `aria-sort="ascending"`, `"descending"`, or `"none"`, and the `MatTable` must have a `<caption>` element.
- Apply `aria-busy="true"` to the table container while data is loading, and move focus to the first data row once loading completes.
- Text contrast ratio must be at least 4.5:1 for normal text and 3:1 for large text in both light and dark themes — status badges and expiry indicators must never use colour as the sole indicator, always pair with a text label or icon.
- Run axe-core via jasmine-axe in every component spec, and manually test with VoiceOver (Mac) or NVDA (Windows) before submission.
