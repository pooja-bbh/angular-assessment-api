export type LineOfBusiness = 'Property' | 'Casualty' | 'A&H' | 'Marine';

export type PolicyStatus = 'Active' | 'Expired' | 'Pending' | 'Cancelled';

export type PolicyRegion =
  | 'Singapore'
  | 'Hong Kong'
  | 'Australia'
  | 'Japan'
  | 'Thailand'
  | 'Malaysia'
  | 'Indonesia'
  | 'New Zealand';

export type PolicyCurrency = 'USD' | 'SGD' | 'HKD' | 'AUD' | 'JPY' | 'THB';

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

export type SortDirection = 'asc' | 'desc' | '';

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

export interface DateRange {
  readonly start: string | null;
  readonly end: string | null;
}

export interface PolicyFilter {
  readonly status?: readonly PolicyStatus[];
  readonly lineOfBusiness?: LineOfBusiness;
  readonly region?: PolicyRegion;
  readonly dateRange?: DateRange;
  readonly search?: string;
  readonly page: number;
  readonly pageSize: number;
  readonly sortColumn: PolicySortColumn;
  readonly sortDirection: SortDirection;
}

export interface PolicyPage {
  readonly content: readonly Policy[];
  readonly page: number;
  readonly size: number;
  readonly totalElements: number;
  readonly totalPages: number;
}

export interface PolicyStats {
  readonly countByStatus: Record<PolicyStatus, number>;
  readonly totalPremiumByLob: Record<LineOfBusiness, number>;
  readonly expiringWithin30Days: number;
}
