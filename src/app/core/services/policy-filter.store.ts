import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Params } from '@angular/router';
import {
  LINES_OF_BUSINESS,
  POLICY_REGIONS,
  POLICY_SORT_COLUMNS,
  POLICY_STATUSES,
  SORT_DIRECTIONS,
} from '../models/policy.constants';
import {
  DateRange,
  LineOfBusiness,
  PolicyFilter,
  PolicyRegion,
  PolicySortColumn,
  PolicyStatus,
  SortDirection,
} from '../models/policy.model';
import { LoggingService } from './logging.service';
import { StorageKey, StorageService } from './storage.service';

/** The criteria portion of a filter — everything except pagination and sorting. */
export type PolicyFilterCriteria = Pick<PolicyFilter, 'status' | 'lineOfBusiness' | 'region' | 'dateRange' | 'search'>;

/** Snapshot used to seed the store's signals on construction. */
interface FilterState {
  readonly filters: PolicyFilterCriteria;
  readonly page: number;
  readonly pageSize: number;
  readonly sortColumn: PolicySortColumn;
  readonly sortDirection: SortDirection;
}

const DEFAULT_PAGE = 0;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT_COLUMN: PolicySortColumn = 'policyNumber';
const DEFAULT_SORT_DIRECTION: SortDirection = 'asc';

/**
 * Signal-based store for the policy list's filter, pagination, and sort state.
 *
 * Pure signals only — no RxJS (tech-stack.md). Smart components read the exposed
 * read-only signals and mutate state through the methods (never the signals
 * directly), per components-services-state.md. State is restored from and persisted
 * to `StorageService`; every change is logged at debug level via `LoggingService`.
 */
@Injectable({ providedIn: 'root' })
export class PolicyFilterStore {
  private readonly storage = inject(StorageService);
  private readonly logger = inject(LoggingService);
  private readonly context = 'PolicyFilterStore';

  private readonly initialState = this.restoreState();

  private readonly filtersSignal = signal<PolicyFilterCriteria>(this.initialState.filters);
  private readonly pageSignal = signal<number>(this.initialState.page);
  private readonly pageSizeSignal = signal<number>(this.initialState.pageSize);
  private readonly sortColumnSignal = signal<PolicySortColumn>(this.initialState.sortColumn);
  private readonly sortDirectionSignal = signal<SortDirection>(this.initialState.sortDirection);

  /** Active filter criteria (status, line of business, region, date range, search). */
  readonly filters = this.filtersSignal.asReadonly();
  /** Current zero-based page index. */
  readonly page = this.pageSignal.asReadonly();
  /** Number of rows per page. */
  readonly pageSize = this.pageSizeSignal.asReadonly();
  /** Column the table is sorted by. */
  readonly sortColumn = this.sortColumnSignal.asReadonly();
  /** Direction of the current sort (`''` when unsorted). */
  readonly sortDirection = this.sortDirectionSignal.asReadonly();

  /** The full `PolicyFilter` to hand to `PolicyService.getPolicies()`. */
  readonly queryParams = computed<PolicyFilter>(() => ({
    ...this.filtersSignal(),
    page: this.pageSignal(),
    pageSize: this.pageSizeSignal(),
    sortColumn: this.sortColumnSignal(),
    sortDirection: this.sortDirectionSignal(),
  }));

  /** True when any filtering criterion is set (ignores pagination and sorting). */
  readonly hasActiveFilters = computed<boolean>(() => {
    const criteria = this.filtersSignal();
    return Boolean(
      criteria.status?.length ||
        criteria.lineOfBusiness ||
        criteria.region ||
        criteria.search?.trim() ||
        criteria.dateRange?.start ||
        criteria.dateRange?.end,
    );
  });

  constructor() {
    // Runs on init and after every change: logs the new state and persists it.
    effect(() => {
      const params = this.queryParams();
      this.logger.debug(this.context, 'Filter state changed', params);
      this.storage.set(StorageKey.PolicyFilters, params);
    });
  }

  /** Merge partial criteria and return to the first page. */
  patchFilters(partial: Partial<PolicyFilterCriteria>): void {
    this.filtersSignal.update((current) => ({ ...current, ...partial }));
    this.pageSignal.set(DEFAULT_PAGE);
  }

  /** Set the free-text search term (cleared when blank), returning to the first page. */
  setSearch(search: string): void {
    const trimmed = search.trim();
    this.patchFilters({ search: trimmed === '' ? undefined : trimmed });
  }

  /** Clear all filtering criteria, keeping page size and sort. */
  clearFilters(): void {
    this.filtersSignal.set({});
    this.pageSignal.set(DEFAULT_PAGE);
  }

  /** Move to a specific zero-based page. */
  setPage(page: number): void {
    this.pageSignal.set(Math.max(0, Math.trunc(page)));
  }

  /** Change the page size, returning to the first page. */
  setPageSize(pageSize: number): void {
    this.pageSizeSignal.set(Math.max(1, Math.trunc(pageSize)));
    this.pageSignal.set(DEFAULT_PAGE);
  }

  /** Change the sort column/direction, returning to the first page. */
  setSort(column: PolicySortColumn, direction: SortDirection): void {
    this.sortColumnSignal.set(column);
    this.sortDirectionSignal.set(direction);
    this.pageSignal.set(DEFAULT_PAGE);
  }

  /** Reset every dimension of the store to its default. */
  reset(): void {
    this.filtersSignal.set({});
    this.pageSignal.set(DEFAULT_PAGE);
    this.pageSizeSignal.set(DEFAULT_PAGE_SIZE);
    this.sortColumnSignal.set(DEFAULT_SORT_COLUMN);
    this.sortDirectionSignal.set(DEFAULT_SORT_DIRECTION);
  }

  /**
   * Hydrate the store from URL query params (deep-link / refresh support).
   * Validated the same way as restored storage — URL input is untrusted.
   * Expected params: `page`, `size`, `sort`, `dir`, `status` (comma-separated),
   * `lob`, `region`, `q`, `start`, `end`.
   */
  initFromUrl(params: Params): void {
    const lineOfBusiness: unknown = params['lob'];
    const region: unknown = params['region'];
    const search: unknown = params['q'];
    const start: unknown = params['start'];
    const end: unknown = params['end'];
    const statuses = this.splitParam(params['status']).filter((value) => this.isStatus(value));

    this.filtersSignal.set({
      ...(statuses.length ? { status: statuses } : {}),
      ...(this.isLineOfBusiness(lineOfBusiness) ? { lineOfBusiness } : {}),
      ...(this.isRegion(region) ? { region } : {}),
      ...(typeof search === 'string' && search.trim() ? { search: search.trim() } : {}),
      ...(typeof start === 'string' || typeof end === 'string'
        ? { dateRange: { start: typeof start === 'string' ? start : null, end: typeof end === 'string' ? end : null } }
        : {}),
    });
    this.pageSignal.set(this.toNonNegativeInt(this.toNumber(params['page']), DEFAULT_PAGE));
    this.pageSizeSignal.set(this.toPositiveInt(this.toNumber(params['size']), DEFAULT_PAGE_SIZE));
    if (this.isSortColumn(params['sort'])) {
      this.sortColumnSignal.set(params['sort']);
    }
    if (this.isSortDirection(params['dir'])) {
      this.sortDirectionSignal.set(params['dir']);
    }
  }

  private restoreState(): FilterState {
    const stored = this.storage.get<Partial<PolicyFilter>>(StorageKey.PolicyFilters);
    if (!stored) {
      return this.defaultState();
    }
    return {
      filters: this.sanitiseCriteria(stored),
      page: this.toNonNegativeInt(stored.page, DEFAULT_PAGE),
      pageSize: this.toPositiveInt(stored.pageSize, DEFAULT_PAGE_SIZE),
      sortColumn: this.isSortColumn(stored.sortColumn) ? stored.sortColumn : DEFAULT_SORT_COLUMN,
      sortDirection: this.isSortDirection(stored.sortDirection) ? stored.sortDirection : DEFAULT_SORT_DIRECTION,
    };
  }

  private defaultState(): FilterState {
    return {
      filters: {},
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
      sortColumn: DEFAULT_SORT_COLUMN,
      sortDirection: DEFAULT_SORT_DIRECTION,
    };
  }

  // Restored values come from untrusted storage, so each field is validated before use.
  private sanitiseCriteria(stored: Partial<PolicyFilter>): PolicyFilterCriteria {
    const search = typeof stored.search === 'string' ? stored.search.trim() : '';
    const statuses = Array.isArray(stored.status) ? stored.status.filter((value) => this.isStatus(value)) : [];
    return {
      ...(statuses.length ? { status: statuses } : {}),
      ...(this.isLineOfBusiness(stored.lineOfBusiness) ? { lineOfBusiness: stored.lineOfBusiness } : {}),
      ...(this.isRegion(stored.region) ? { region: stored.region } : {}),
      ...(search ? { search } : {}),
      ...(this.isDateRange(stored.dateRange) ? { dateRange: stored.dateRange } : {}),
    };
  }

  private toNumber(value: unknown): number | undefined {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  }

  private splitParam(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string');
    }
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
    }
    return [];
  }

  private toNonNegativeInt(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.trunc(value) : fallback;
  }

  private toPositiveInt(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 1 ? Math.trunc(value) : fallback;
  }

  private isStatus(value: unknown): value is PolicyStatus {
    return typeof value === 'string' && (POLICY_STATUSES as readonly string[]).includes(value);
  }

  private isLineOfBusiness(value: unknown): value is LineOfBusiness {
    return typeof value === 'string' && (LINES_OF_BUSINESS as readonly string[]).includes(value);
  }

  private isRegion(value: unknown): value is PolicyRegion {
    return typeof value === 'string' && (POLICY_REGIONS as readonly string[]).includes(value);
  }

  private isSortColumn(value: unknown): value is PolicySortColumn {
    return typeof value === 'string' && (POLICY_SORT_COLUMNS as readonly string[]).includes(value);
  }

  private isSortDirection(value: unknown): value is SortDirection {
    return typeof value === 'string' && (SORT_DIRECTIONS as readonly string[]).includes(value);
  }

  private isDateRange(value: unknown): value is DateRange {
    if (typeof value !== 'object' || value === null) {
      return false;
    }
    const candidate = value as Record<string, unknown>;
    const validStart = candidate['start'] === null || typeof candidate['start'] === 'string';
    const validEnd = candidate['end'] === null || typeof candidate['end'] === 'string';
    return validStart && validEnd;
  }
}
