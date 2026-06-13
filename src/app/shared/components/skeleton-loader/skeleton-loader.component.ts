import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Dumb loading placeholder approximating the policy table's shape.
 *
 * Renders `rows` animated rows of column-shaped bars using a CSS pulse on the
 * surface-variant token. Carries `role="status"` + `aria-label` so the loading
 * state is announced (accessibility.md), and `aria-busy` while visible.
 */
@Component({
  selector: 'app-skeleton-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="skeleton" role="status" aria-label="Loading policies" aria-busy="true">
      @for (row of placeholderRows(); track $index) {
        <div class="skeleton__row">
          @for (cell of columns; track $index) {
            <span class="skeleton__cell"></span>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .skeleton {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
      }

      .skeleton__row {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: var(--spacing-md);
      }

      .skeleton__cell {
        height: var(--spacing-md);
        border-radius: var(--radius-sm);
        background: var(--color-surface-variant);
        animation: skeleton-pulse 1.5s ease-in-out infinite;
      }

      @keyframes skeleton-pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.4;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .skeleton__cell {
          animation: none;
        }
      }
    `,
  ],
})
export class SkeletonLoaderComponent {
  readonly rows = input<number>(5);

  // Six bars per row, mirroring the policy table's column count.
  protected readonly columns = Array.from({ length: 6 });

  readonly placeholderRows = computed(() => Array.from({ length: Math.max(0, Math.trunc(this.rows())) }));
}
