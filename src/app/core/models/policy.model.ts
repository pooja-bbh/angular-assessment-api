/**
 * Line of business a policy belongs to.
 * String union (not a numeric enum) per coding-standards.md.
 */
export type LineOfBusiness = 'Property' | 'Casualty' | 'A&H' | 'Marine';

/** Lifecycle status of a policy. */
export type PolicyStatus = 'Active' | 'Expired' | 'Pending' | 'Cancelled';

/** The eight APAC regions served by the dashboard. */
export type PolicyRegion =
  | 'Singapore'
  | 'Hong Kong'
  | 'Australia'
  | 'Japan'
  | 'Thailand'
  | 'Malaysia'
  | 'Indonesia'
  | 'New Zealand';

/** ISO 4217 currency codes used across APAC premiums. */
export type PolicyCurrency = 'USD' | 'SGD' | 'HKD' | 'AUD' | 'JPY' | 'THB';

/** Columns the policy table can be sorted by. */
export type PolicySortColumn =
  | 'policyNumber'
  | 'policyholderName'
  | 'lineOfBusiness'
  | 'status'
  | 'premiumAmount'
  | 'effectiveDate'
  | 'expiryDate'
  | 'region'
  | 'underwriter';

/** Sort direction, mirroring Angular Material's `SortDirection` literals. */
export type SortDirection = 'asc' | 'desc' | '';

/**
 * A single insurance policy as returned by the BFF.
 *
 * `premiumAmount` is a raw number paired with `currency` so the view can format
 * it via `CurrencyPipe` (i18n.md) — amounts are never pre-formatted strings.
 * `effectiveDate` / `expiryDate` are ISO 8601 date strings, formatted via `DatePipe`.
 */
export interface Policy {
  readonly id: string;
  readonly policyNumber: string;
  readonly policyholderName: string;
  readonly lineOfBusiness: LineOfBusiness;
  readonly status: PolicyStatus;
  readonly premiumAmount: number;
  readonly currency: PolicyCurrency;
  readonly effectiveDate: string;
  readonly expiryDate: string;
  readonly region: PolicyRegion;
  readonly underwriter: string;
  readonly flaggedForReview: boolean;
}

/** Inclusive date range used by the policy filter (ISO 8601 strings, or null when unset). */
export interface DateRange {
  readonly start: string | null;
  readonly end: string | null;
}

/**
 * Full set of filter, pagination, and sort criteria the policy list sends to the API.
 * Optional fields are omitted from the query string when unset.
 */
export interface PolicyFilter {
  readonly status?: PolicyStatus;
  readonly lineOfBusiness?: LineOfBusiness;
  readonly region?: PolicyRegion;
  readonly dateRange?: DateRange;
  readonly search?: string;
  readonly page: number;
  readonly pageSize: number;
  readonly sortColumn: PolicySortColumn;
  readonly sortDirection: SortDirection;
}

/** Server-side paginated response envelope for a policy query. */
export interface PolicyPage {
  readonly content: readonly Policy[];
  readonly page: number;
  readonly size: number;
  readonly totalElements: number;
  readonly totalPages: number;
}

/**
 * Aggregated portfolio statistics for the summary panel.
 *
 * Premium totals are keyed by line of business; callers must present each total
 * alongside its currency context (i18n.md) — totals here are pre-aggregated by the BFF.
 */
export interface PolicyStats {
  readonly countByStatus: Record<PolicyStatus, number>;
  readonly totalPremiumByLob: Record<LineOfBusiness, number>;
  readonly expiringWithin30Days: number;
}
