import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

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

  protected readonly columns = Array.from({ length: 6 });

  readonly placeholderRows = computed(() => Array.from({ length: Math.max(0, Math.trunc(this.rows())) }));
}
