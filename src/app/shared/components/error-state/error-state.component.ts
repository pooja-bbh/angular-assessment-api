import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Dumb error-state panel shown when a request fails.
 *
 * Centres an error icon, the (already user-friendly) message, and an optional
 * retry button. Carries `role="alert"` so screen readers announce it immediately
 * (accessibility.md). Emits `retry` up via an `output()`; the parent smart
 * component re-triggers the API call (error-handling.md).
 */
@Component({
  selector: 'app-error-state',
  imports: [MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="error-state" role="alert">
      <mat-icon class="error-state__icon" aria-hidden="true">error_outline</mat-icon>
      <p class="error-state__message">{{ message() }}</p>
      @if (showRetry()) {
        <button mat-flat-button type="button" (click)="retry.emit()">Retry</button>
      }
    </div>
  `,
  styles: [
    `
      .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-md);
        padding: var(--spacing-xl);
        text-align: center;
        color: var(--color-on-surface);
      }

      .error-state__icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        color: var(--color-error);
      }

      .error-state__message {
        margin: 0;
        font-size: var(--font-size-lg);
      }
    `,
  ],
})
export class ErrorStateComponent {
  readonly message = input.required<string>();
  readonly showRetry = input<boolean>(true);

  readonly retry = output<void>();
}
