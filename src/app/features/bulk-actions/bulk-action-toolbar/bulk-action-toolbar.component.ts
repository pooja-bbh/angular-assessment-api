import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Dumb toolbar shown when one or more policies are selected.
 *
 * Reports the selection count and emits bulk actions up via `output()` — it owns
 * no state. `role="region"` + `aria-live` announce the selection to screen readers.
 */
@Component({
  selector: 'app-bulk-action-toolbar',
  imports: [MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bulk-action-toolbar" role="region" i18n-aria-label="@@bulkToolbarAria" aria-label="Bulk actions">
      <span class="bulk-action-toolbar__count" aria-live="polite" i18n="@@bulkSelectedCount"
        >{selectedCount(), plural, =1 {1 policy selected} other {{{ selectedCount() }} policies selected}}</span
      >
      <span class="bulk-action-toolbar__spacer"></span>
      <button mat-stroked-button type="button" (click)="clearSelection.emit()">
        <mat-icon aria-hidden="true">clear</mat-icon>
        <span i18n="@@bulkClear">Clear</span>
      </button>
      <button mat-flat-button type="button" (click)="flagForReview.emit()">
        <mat-icon aria-hidden="true">flag</mat-icon>
        <span i18n="@@bulkFlagForReview">Flag for review</span>
      </button>
    </div>
  `,
  styles: [
    `
      .bulk-action-toolbar {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm) var(--spacing-md);
        border-radius: var(--radius-sm);
        background: var(--color-surface-variant);
        color: var(--color-on-surface);
      }

      .bulk-action-toolbar__count {
        font-weight: var(--font-weight-medium);
      }

      .bulk-action-toolbar__spacer {
        flex: 1 1 auto;
      }
    `,
  ],
})
export class BulkActionToolbarComponent {
  readonly selectedCount = input.required<number>();

  readonly flagForReview = output<void>();
  readonly clearSelection = output<void>();
}
