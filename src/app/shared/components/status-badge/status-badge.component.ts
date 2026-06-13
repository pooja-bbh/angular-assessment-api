import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PolicyStatus } from '../../../core/models/policy.model';

/**
 * Dumb badge that renders a policy status as a labelled chip.
 *
 * The status text label is always shown, so colour is never the sole indicator
 * (accessibility.md); the semantic fill is paired with an AA-contrast text colour.
 * Exposes an `aria-label` matching the status.
 */
@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="badgeClass()" role="img" [attr.aria-label]="status()">
      <span class="status-badge__label">{{ status() }}</span>
    </span>
  `,
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  readonly status = input.required<PolicyStatus>();

  // Base class plus a status-driven BEM modifier; keeps the template logic-free.
  readonly badgeClass = computed(() => `status-badge status-badge--${this.status().toLowerCase()}`);
}
