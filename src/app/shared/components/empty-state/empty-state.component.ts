import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  imports: [MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state" role="status">
      <mat-icon class="empty-state__icon" aria-hidden="true">inbox</mat-icon>
      <p class="empty-state__message">{{ message() }}</p>
      @if (showCta()) {
        <button mat-stroked-button type="button" (click)="ctaClick.emit()">Clear filters</button>
      }
    </div>
  `,
  styles: [
    `
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-md);
        padding: var(--spacing-xl);
        text-align: center;
        color: var(--color-on-surface);
      }

      .empty-state__icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        color: var(--color-on-surface);
        opacity: 0.6;
      }

      .empty-state__message {
        margin: 0;
        font-size: var(--font-size-lg);
      }
    `,
  ],
})
export class EmptyStateComponent {
  readonly message = input<string>('No policies found');
  readonly showCta = input<boolean>(false);

  readonly ctaClick = output<void>();
}
