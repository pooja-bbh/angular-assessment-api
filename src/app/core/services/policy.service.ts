import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppError } from '../models/app-error.model';
import { LINES_OF_BUSINESS, POLICY_STATUSES } from '../models/policy.constants';
import { LineOfBusiness, Policy, PolicyFilter, PolicyPage, PolicyStats, PolicyStatus } from '../models/policy.model';
import { LoggingService } from './logging.service';

/** Subset of the json-server v1 pagination envelope the service consumes. */
interface JsonServerPage<T> {
  readonly data: readonly T[];
  readonly items: number;
  readonly pages: number;
}

const EXPIRY_WINDOW_DAYS = 30;
const MILLISECONDS_PER_DAY = 86_400_000;

/**
 * Single source of policy data. All HTTP goes through `HttpClient` here; the rest
 * of the app consumes the clean `PolicyPage` / `PolicyStats` contract and never
 * sees the mock server's wire format.
 *
 * Methods return Observables (rather than `httpResource()`) so they are directly
 * testable with `HttpClientTestingModule` / `HttpTestingController` (testing.md);
 * smart components fold the result into signals.
 */
@Injectable({ providedIn: 'root' })
export class PolicyService {
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggingService);

  private readonly policiesUrl = `${environment.apiBaseUrl}/policies`;
  private readonly context = 'PolicyService';
  private readonly minPageSize = 1;
  private readonly maxPageSize = 100;

  // User-friendly messages mapped from HTTP status codes (error-handling.md).
  private readonly messagesByStatus: Readonly<Record<number, AppError>> = {
    0: { code: 'NETWORK', message: "Can't reach the server. Check your connection and try again.", statusCode: 0 },
    400: { code: 'BAD_REQUEST', message: 'The request was invalid. Please adjust your filters and try again.', statusCode: 400 },
    401: { code: 'UNAUTHORIZED', message: 'Your session has expired. Please sign in again.', statusCode: 401 },
    403: { code: 'FORBIDDEN', message: "You don't have permission to view this data.", statusCode: 403 },
    404: { code: 'NOT_FOUND', message: 'The requested policies could not be found.', statusCode: 404 },
    408: { code: 'TIMEOUT', message: 'The request timed out. Please try again.', statusCode: 408 },
    409: { code: 'CONFLICT', message: 'This action conflicts with the current data. Refresh and try again.', statusCode: 409 },
    422: { code: 'UNPROCESSABLE', message: 'Some values were rejected. Please review your input and try again.', statusCode: 422 },
    429: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests. Please wait a moment and try again.', statusCode: 429 },
  };

  /** Fetch one server-side page of policies for the given filter. */
  getPolicies(filter: PolicyFilter): Observable<PolicyPage> {
    const params = this.buildParams(filter);
    this.logger.debug(this.context, 'Fetching policies', { url: this.policiesUrl });

    return this.http.get<JsonServerPage<Policy>>(this.policiesUrl, { params }).pipe(
      map((response) => this.toPolicyPage(response, filter)),
      catchError((error: HttpErrorResponse) => this.handleError(error, 'load policies')),
    );
  }

  /** Fetch the full set once and aggregate the summary statistics. */
  getStats(): Observable<PolicyStats> {
    return this.http.get<readonly Policy[]>(this.policiesUrl).pipe(
      map((policies) => this.computeStats(policies)),
      catchError((error: HttpErrorResponse) => this.handleError(error, 'load statistics')),
    );
  }

  /** Flag or unflag a single policy for review. */
  setFlaggedForReview(policyId: string, flaggedForReview: boolean): Observable<Policy> {
    return this.http.patch<Policy>(`${this.policiesUrl}/${encodeURIComponent(policyId)}`, { flaggedForReview }).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, 'update the review flag')),
    );
  }

  /** Flag or unflag many policies in one bulk action. */
  bulkSetFlaggedForReview(policyIds: readonly string[], flaggedForReview: boolean): Observable<readonly Policy[]> {
    if (policyIds.length === 0) {
      return forkJoin([] as Observable<Policy>[]);
    }
    return forkJoin(policyIds.map((id) => this.setFlaggedForReview(id, flaggedForReview)));
  }

  private buildParams(filter: PolicyFilter): HttpParams {
    const page = Math.max(0, Math.trunc(filter.page));
    const pageSize = Math.min(this.maxPageSize, Math.max(this.minPageSize, Math.trunc(filter.pageSize)));

    // json-server pages are 1-based; the app contract is 0-based.
    let params = new HttpParams().set('_page', String(page + 1)).set('_per_page', String(pageSize));

    if (filter.sortColumn && filter.sortDirection !== '') {
      const prefix = filter.sortDirection === 'desc' ? '-' : '';
      params = params.set('_sort', `${prefix}${filter.sortColumn}`);
    }
    if (filter.status) {
      params = params.set('status', filter.status);
    }
    if (filter.lineOfBusiness) {
      params = params.set('lineOfBusiness', filter.lineOfBusiness);
    }
    if (filter.region) {
      params = params.set('region', filter.region);
    }

    const search = filter.search?.trim();
    if (search) {
      params = params.set('q', search);
    }
    if (filter.dateRange?.start) {
      params = params.set('effectiveDate_gte', filter.dateRange.start);
    }
    if (filter.dateRange?.end) {
      params = params.set('effectiveDate_lte', filter.dateRange.end);
    }

    return params;
  }

  private toPolicyPage(response: JsonServerPage<Policy>, filter: PolicyFilter): PolicyPage {
    return {
      content: response.data ?? [],
      page: filter.page,
      size: filter.pageSize,
      totalElements: response.items ?? 0,
      totalPages: response.pages ?? 0,
    };
  }

  private computeStats(policies: readonly Policy[]): PolicyStats {
    const countByStatus = POLICY_STATUSES.reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {} as Record<PolicyStatus, number>,
    );
    // Premiums are summed within each line of business; a real BFF would normalise
    // currency first — totals here mirror the mock data's raw amounts.
    const totalPremiumByLob = LINES_OF_BUSINESS.reduce(
      (acc, lob) => ({ ...acc, [lob]: 0 }),
      {} as Record<LineOfBusiness, number>,
    );

    const now = Date.now();
    const windowEnd = now + EXPIRY_WINDOW_DAYS * MILLISECONDS_PER_DAY;
    let expiringWithin30Days = 0;

    for (const policy of policies) {
      countByStatus[policy.status] += 1;
      totalPremiumByLob[policy.lineOfBusiness] += policy.premiumAmount;

      const expiry = Date.parse(policy.expiryDate);
      if (!Number.isNaN(expiry) && expiry >= now && expiry <= windowEnd) {
        expiringWithin30Days += 1;
      }
    }

    return { countByStatus, totalPremiumByLob, expiringWithin30Days };
  }

  private handleError(error: HttpErrorResponse, action: string): Observable<never> {
    const appError = this.toAppError(error.status);
    // Log a summary only — never the response body, PII, or premium amounts.
    this.logger.error(this.context, `Failed to ${action}`, { status: error.status, url: error.url });
    return throwError(() => appError);
  }

  private toAppError(status: number): AppError {
    const mapped = this.messagesByStatus[status];
    if (mapped) {
      return mapped;
    }
    if (status >= 500 && status <= 599) {
      return { code: 'SERVER_ERROR', message: 'Something went wrong on our end. Please try again shortly.', statusCode: status };
    }
    return { code: 'UNKNOWN', message: 'Something went wrong while loading policies. Please try again.', statusCode: status };
  }
}
