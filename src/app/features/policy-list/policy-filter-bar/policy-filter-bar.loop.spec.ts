import { TestBed } from '@angular/core/testing';
import { PolicyFilter } from '../../../core/models/policy.model';
import { PolicyFilterBarComponent } from './policy-filter-bar.component';

// Reproduction: setting `currentFilters` (what the dashboard does on every store
// change) must NOT cause the component to emit `filterChange` — otherwise the
// dashboard re-patches the store, queryParams changes again, and the table/stats
// re-fetch forever (perpetual loading).
describe('PolicyFilterBarComponent — feedback loop check', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PolicyFilterBarComponent] }).compileComponents();
  });

  it('does not emit filterChange when currentFilters input changes', () => {
    const fixture = TestBed.createComponent(PolicyFilterBarComponent);
    const base: PolicyFilter = { page: 0, pageSize: 20, sortColumn: 'policyNumber', sortDirection: 'asc' };
    fixture.componentRef.setInput('currentFilters', base);
    fixture.detectChanges();

    const emissions: Partial<PolicyFilter>[] = [];
    fixture.componentInstance.filterChange.subscribe((v) => emissions.push(v));

    // Simulate the dashboard pushing new filter state back down (incl. a date range).
    fixture.componentRef.setInput('currentFilters', {
      ...base,
      search: 'POL-0XT9A3',
      dateRange: { start: '2024-01-01', end: null },
    });
    fixture.detectChanges();

    expect(emissions).toEqual([]);
  });
});
