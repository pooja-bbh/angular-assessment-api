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
  styleUrl: './skeleton-loader.component.scss',
})
export class SkeletonLoaderComponent {
  readonly rows = input<number>(5);

  // Six bars per row, mirroring the policy table's column count.
  protected readonly columns = Array.from({ length: 6 });

  readonly placeholderRows = computed(() => Array.from({ length: Math.max(0, Math.trunc(this.rows())) }));
}
