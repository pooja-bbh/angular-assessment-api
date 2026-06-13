import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { LoggingService } from './logging.service';
import { PolicyFilterStore } from './policy-filter.store';

describe('PolicyFilterStore', () => {
  let store: PolicyFilterStore;

  beforeEach(() => {
    // Start from a clean slate — the store restores from / persists to localStorage.
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LoggingService,
          useValue: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        },
      ],
    });
    store = TestBed.inject(PolicyFilterStore);
  });

  it('starts with sensible defaults', () => {
    expect(store.page()).toBe(0);
    expect(store.pageSize()).toBe(20);
    expect(store.sortColumn()).toBe('policyNumber');
    expect(store.sortDirection()).toBe('asc');
    expect(store.filters()).toEqual({});
    expect(store.hasActiveFilters()).toBe(false);
    expect(store.queryParams()).toEqual({
      page: 0,
      pageSize: 20,
      sortColumn: 'policyNumber',
      sortDirection: 'asc',
    });
  });

  it('patchFilters merges criteria, flips hasActiveFilters, and resets to page 0', () => {
    store.setPage(3);
    store.patchFilters({ status: ['Active'] });

    expect(store.filters().status).toEqual(['Active']);
    expect(store.hasActiveFilters()).toBe(true);
    expect(store.page()).toBe(0);
    expect(store.queryParams().status).toEqual(['Active']);
  });

  it('setSearch trims the term and clears it when blank', () => {
    store.setSearch('  Tan  ');
    expect(store.filters().search).toBe('Tan');

    store.setSearch('   ');
    expect(store.filters().search).toBeUndefined();
  });

  it('clearFilters removes criteria but keeps sort and page size', () => {
    store.patchFilters({ region: 'Japan' });
    store.setPageSize(50);
    store.setSort('premiumAmount', 'desc');

    store.clearFilters();

    expect(store.filters()).toEqual({});
    expect(store.hasActiveFilters()).toBe(false);
    expect(store.pageSize()).toBe(50);
    expect(store.sortColumn()).toBe('premiumAmount');
    expect(store.page()).toBe(0);
  });

  it('setPage clamps negatives to 0', () => {
    store.setPage(5);
    expect(store.page()).toBe(5);

    store.setPage(-2);
    expect(store.page()).toBe(0);
  });

  it('setPageSize updates the size and resets to page 0', () => {
    store.setPage(4);
    store.setPageSize(50);

    expect(store.pageSize()).toBe(50);
    expect(store.page()).toBe(0);
  });

  it('setSort updates column/direction and resets to page 0', () => {
    store.setPage(4);
    store.setSort('expiryDate', 'desc');

    expect(store.sortColumn()).toBe('expiryDate');
    expect(store.sortDirection()).toBe('desc');
    expect(store.page()).toBe(0);
  });

  it('reset restores every dimension to its default', () => {
    store.patchFilters({ status: ['Expired'] });
    store.setPageSize(50);
    store.setSort('premiumAmount', 'desc');

    store.reset();

    expect(store.filters()).toEqual({});
    expect(store.pageSize()).toBe(20);
    expect(store.sortColumn()).toBe('policyNumber');
    expect(store.sortDirection()).toBe('asc');
    expect(store.page()).toBe(0);
  });

  it('initFromUrl hydrates valid params and discards invalid ones', () => {
    store.initFromUrl({
      page: '2',
      size: '50',
      sort: 'status',
      dir: 'desc',
      status: 'Active,Expired,Bogus',
      lob: 'Property',
      region: 'Japan',
      q: 'tan',
      start: '2024-01-01',
      end: '2024-12-31',
    });

    expect(store.page()).toBe(2);
    expect(store.pageSize()).toBe(50);
    expect(store.sortColumn()).toBe('status');
    expect(store.sortDirection()).toBe('desc');
    expect(store.filters().status).toEqual(['Active', 'Expired']); // 'Bogus' is filtered out
    expect(store.filters().lineOfBusiness).toBe('Property');
    expect(store.filters().region).toBe('Japan');
    expect(store.filters().search).toBe('tan');
    expect(store.filters().dateRange).toEqual({ start: '2024-01-01', end: '2024-12-31' });
  });

  it('initFromUrl falls back to defaults for invalid scalar params', () => {
    store.initFromUrl({ page: 'abc', size: '-5', sort: 'nope', dir: 'sideways' });

    expect(store.page()).toBe(0);
    expect(store.pageSize()).toBe(20);
    expect(store.sortColumn()).toBe('policyNumber');
    expect(store.sortDirection()).toBe('asc');
    expect(store.filters()).toEqual({});
  });
});
