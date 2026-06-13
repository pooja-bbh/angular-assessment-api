import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PolicyFilter } from '../../../core/models/policy.model';
import { PolicyFilterStore } from '../../../core/services/policy-filter.store';
import { PolicyStatsComponent } from '../../policy-stats/policy-stats.component';
import { PolicyFilterBarComponent } from '../policy-filter-bar/policy-filter-bar.component';
import { PolicyTableComponent } from '../policy-table/policy-table.component';

/**
 * Smart container composing the dashboard: filter bar, stats panel, and policy
 * table. It owns the wiring from the (dumb) filter bar's outputs to the
 * `PolicyFilterStore`; the stats panel and table read the store themselves.
 */
@Component({
  selector: 'app-dashboard',
  imports: [PolicyFilterBarComponent, PolicyStatsComponent, PolicyTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard">
      <app-policy-filter-bar
        [currentFilters]="filterStore.queryParams()"
        (filterChange)="onFilterChange($event)"
        (resetFilters)="onResetFilters()"
      />
      <app-policy-stats />
      <app-policy-table />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .dashboard {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
        padding: var(--spacing-lg);
      }
    `,
  ],
})
export class DashboardComponent {
  protected readonly filterStore = inject(PolicyFilterStore);

  onFilterChange(change: Partial<PolicyFilter>): void {
    this.filterStore.patchFilters(change);
  }

  onResetFilters(): void {
    this.filterStore.clearFilters();
  }
}
