# Styling Rules

## Theming
- Use Angular Material's theming system as the foundation — do not build a parallel design system alongside it.
- Define both light and dark themes in `styles.scss` using `mat.define-theme()` and apply them via body classes.
- Use Angular Material's typography scale for all text — never define a parallel type scale.

## Design Tokens
- Use CSS custom properties (design tokens) for all colours, spacing, radius, and typography values — never hardcode hex codes or pixel values in component stylesheets.
- Define all design tokens as CSS custom properties in `:root` and override colour tokens in `body.theme-dark`:

```scss
:root {
  --color-surface:         #ffffff;
  --color-surface-variant: #f5f5f5;
  --color-on-surface:      #212121;
  --color-primary:         #1565c0;
  --color-on-primary:      #ffffff;
  --color-error:           #b71c1c;
  --color-warning:         #e65100;
  --color-success:         #2e7d32;
  --spacing-xs: 4px;  --spacing-sm: 8px;  --spacing-md: 16px;
  --spacing-lg: 24px; --spacing-xl: 32px;
  --radius-sm: 4px;   --radius-md: 8px;
  --font-size-sm: 0.75rem; --font-size-base: 0.875rem; --font-size-lg: 1rem;
  --font-weight-normal: 400; --font-weight-medium: 500; --font-weight-bold: 700;
}

body.theme-dark {
  --color-surface:         #121212;
  --color-surface-variant: #1e1e1e;
  --color-on-surface:      #e0e0e0;
  --color-primary:         #90caf9;
  --color-on-primary:      #000000;
}
```

## Stylesheet Organisation
- Keep component stylesheets scoped to layout and component-specific decoration only — never write global selectors inside a component stylesheet.
- `styles.scss` must contain only: the Material theme definition, design token variables, and global resets — never put component-specific styles in `styles.scss`.

## Layout & Responsiveness
- Use CSS Grid or Flexbox for all layout — never use HTML tables for layout purposes.
- The dashboard must be usable on screens 1024px wide and above (desktop and tablet landscape).
- The stats panel and filter bar must stack vertically on viewports narrower than 1024px — use standard CSS media queries for this.
