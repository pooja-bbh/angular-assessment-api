import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, LOCALE_ID } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * Dumb indicator shown on policies nearing expiry.
 *
 * When `isExpiringSoon` is true it renders a warning icon (an icon, not colour
 * alone) carrying an `aria-label` and a tooltip with the formatted expiry date.
 * When false it renders nothing at all (no hidden node).
 */
@Component({
  selector: 'app-expiry-indicator',
  imports: [MatIconModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isExpiringSoon()) {
      <mat-icon
        class="expiry-indicator__icon"
        role="img"
        aria-label="Expiring soon"
        [attr.aria-hidden]="false"
        [matTooltip]="tooltipMessage()"
      >
        warning
      </mat-icon>
    }
  `,
  styles: [
    `
      .expiry-indicator__icon {
        color: var(--color-warning);
      }
    `,
  ],
})
export class ExpiryIndicatorComponent {
  readonly isExpiringSoon = input.required<boolean>();
  readonly expiryDate = input.required<Date>();

  private readonly locale = inject(LOCALE_ID);

  // Formatting lives in the class (DatePipe-equivalent) so the template stays logic-free.
  readonly tooltipMessage = computed(() => `Expires on ${formatDate(this.expiryDate(), 'mediumDate', this.locale)}`);
}
