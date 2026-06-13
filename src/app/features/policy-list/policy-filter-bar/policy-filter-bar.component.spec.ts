import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { PolicyFilter } from '../../../core/models/policy.model';
import { PolicyFilterBarComponent } from './policy-filter-bar.component';

const BASE_FILTER: PolicyFilter = {
  page: 0,
  pageSize: 20,
  sortColumn: 'policyNumber',
  sortDirection: 'asc',
};

describe('PolicyFilterBarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PolicyFilterBarComponent] }).compileComponents();
  });

  function create(filters: PolicyFilter = BASE_FILTER) {
    const fixture = TestBed.createComponent(PolicyFilterBarComponent);
    fixture.componentRef.setInput('currentFilters', filters);
    fixture.detectChanges();
    const emissions: Partial<PolicyFilter>[] = [];
    fixture.componentInstance.filterChange.subscribe((value) => emissions.push(value));
    return { fixture, component: fixture.componentInstance, emissions };
  }

  it('emits a status patch when the status multi-select changes', () => {
    const { component, emissions } = create();
    component.filterForm.controls.status.setValue(['Active', 'Pending']);
    expect(emissions).toContainEqual({ status: ['Active', 'Pending'] });
  });

  it('emits an undefined status when the selection is cleared', () => {
    const { component, emissions } = create();
    component.filterForm.controls.status.setValue([]);
    expect(emissions).toContainEqual({ status: undefined });
  });

  it('emits a line-of-business patch immediately (selects are not debounced)', () => {
    const { component, emissions } = create();
    component.filterForm.controls.lineOfBusiness.setValue('Marine');
    expect(emissions).toContainEqual({ lineOfBusiness: 'Marine' });
  });

  it('emits a date-range patch as ISO strings', () => {
    const { component, emissions } = create();
    component.filterForm.controls.start.setValue(new Date('2024-01-01'));
    expect(emissions.at(-1)).toEqual({ dateRange: { start: '2024-01-01', end: null } });
  });

  it('debounces free-text search by 300ms and trims the term', () => {
    vi.useFakeTimers();
    try {
      const { component, emissions } = create();
      component.filterForm.controls.search.setValue('  POL-123  ');

      vi.advanceTimersByTime(299);
      expect(emissions.some((value) => 'search' in value)).toBe(false);

      vi.advanceTimersByTime(1);
      expect(emissions).toContainEqual({ search: 'POL-123' });
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not re-emit search when the debounced value is unchanged', () => {
    vi.useFakeTimers();
    try {
      const { component, emissions } = create();
      component.filterForm.controls.search.setValue('acme');
      vi.advanceTimersByTime(300);
      component.filterForm.controls.search.setValue('acme');
      vi.advanceTimersByTime(300);

      expect(emissions.filter((value) => 'search' in value)).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows the Clear Filters button when filters are active and emits resetFilters on click', () => {
    const { fixture, component } = create({ ...BASE_FILTER, region: 'Singapore' });
    let reset = false;
    component.resetFilters.subscribe(() => (reset = true));

    const button = fixture.nativeElement.querySelector('.filter-bar__clear') as HTMLButtonElement | null;
    expect(button).not.toBeNull();
    button?.click();
    expect(reset).toBe(true);
  });

  it('hides the Clear Filters button when no filters are active', () => {
    const { fixture } = create();
    expect(fixture.nativeElement.querySelector('.filter-bar__clear')).toBeNull();
  });
});
