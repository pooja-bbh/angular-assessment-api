import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PolicyStatus } from '../../../core/models/policy.model';

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

  readonly badgeClass = computed(() => `status-badge status-badge--${this.status().toLowerCase()}`);
}
