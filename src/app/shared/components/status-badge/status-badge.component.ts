import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PolicyStatus } from '../../../core/models/policy.model';

/**
 * Dumb badge that renders a policy status as a labelled chip.
 *
 * Colour is only a supplementary dot — the status text is always shown and the
 * readable label uses the high-contrast on-surface token, so colour is never the
 * sole indicator (accessibility.md). Exposes an `aria-label` matching the status.
 */
@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="badgeClass()" role="img" [attr.aria-label]="status()">
      <span class="status-badge__dot" aria-hidden="true"></span>
      <span class="status-badge__label">{{ status() }}</span>
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }

      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        background: var(--color-surface-variant);
        color: var(--color-on-surface);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        line-height: 1;
      }

      .status-badge__dot {
        width: var(--spacing-sm);
        height: var(--spacing-sm);
        border-radius: 50%;
        background: var(--color-on-surface);
      }

      .status-badge--active .status-badge__dot {
        background: var(--color-success);
      }

      .status-badge--expired .status-badge__dot {
        background: var(--color-error);
      }

      .status-badge--pending .status-badge__dot {
        background: var(--color-warning);
      }

      .status-badge--cancelled .status-badge__dot {
        background: var(--color-on-surface);
      }
    `,
  ],
})
export class StatusBadgeComponent {
  readonly status = input.required<PolicyStatus>();

  // Base class plus a status-driven BEM modifier; keeps the template logic-free.
  readonly badgeClass = computed(() => `status-badge status-badge--${this.status().toLowerCase()}`);
}
