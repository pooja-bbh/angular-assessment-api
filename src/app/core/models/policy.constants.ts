import { LineOfBusiness, PolicyRegion, PolicySortColumn, PolicyStatus, SortDirection } from './policy.model';

export const POLICY_STATUSES: readonly PolicyStatus[] = ['Active', 'Expired', 'Pending', 'Cancelled'];

export const LINES_OF_BUSINESS: readonly LineOfBusiness[] = ['Property', 'Casualty', 'A&H', 'Marine'];

export const POLICY_REGIONS: readonly PolicyRegion[] = [
  'Singapore',
  'Hong Kong',
  'Australia',
  'Japan',
  'Thailand',
  'Malaysia',
  'Indonesia',
  'New Zealand',
];

export const POLICY_SORT_COLUMNS: readonly PolicySortColumn[] = [
  'policyNumber',
  'policyholderName',
  'lineOfBusiness',
  'status',
  'premiumAmount',
  'effectiveDate',
  'expiryDate',
  'region',
  'underwriter',
];

export const SORT_DIRECTIONS: readonly SortDirection[] = ['asc', 'desc', ''];
