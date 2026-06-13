import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppError } from '../models/app-error.model';
import { LINES_OF_BUSINESS, POLICY_STATUSES } from '../models/policy.constants';
import { LineOfBusiness, Policy, PolicyFilter, PolicyPage, PolicyStats, PolicyStatus } from '../models/policy.model';
import { LoggingService } from './logging.service';

interface JsonServerPage<T> {
  readonly data: readonly T[];
  readonly items: number;
  readonly pages: number;
}

const EXPIRY_WINDOW_DAYS = 30;
const MILLISECONDS_PER_DAY = 86_400_000;

// json-server 1.x has no full-text `q` param — free-text search is expressed as a
// case-insensitive `contains` match across these fields, combined with `or`.
const SEARCH_FIELDS = ['policyNumber', 'policyholderName', 'underwriter'] as const;

interface WhereCondition {
  readonly eq?: string;
  readonly in?: readonly string[];
  readonly gte?: string;
  readonly lte?: string;
  readonly contains?: string;
}

type WhereClause = Record<string, WhereCondition | readonly WhereClause[]>;

@Injectable({ providedIn: 'root' })
export class PolicyService {
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggingService);

  private readonly policiesUrl = `${environment.apiBaseUrl}/policies`;
  private readonly context = 'PolicyService';
  private readonly minPageSize = 1;
  private readonly maxPageSize = 100;

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

  getPolicies(filter: PolicyFilter): Observable<PolicyPage> {
    const params = this.buildParams(filter);
    this.logger.debug(this.context, 'Fetching policies', { url: this.policiesUrl });

    return this.http.get<JsonServerPage<Policy>>(this.policiesUrl, { params }).pipe(
      map((response) => this.toPolicyPage(response, filter)),
      catchError((error: HttpErrorResponse) => this.handleError(error, 'load policies')),
    );
  }

  getStats(): Observable<PolicyStats> {
    return this.http.get<readonly Policy[]>(this.policiesUrl).pipe(
      map((policies) => this.computeStats(policies)),
      catchError((error: HttpErrorResponse) => this.handleError(error, 'load statistics')),
    );
  }

  setFlaggedForReview(policyId: string, flaggedForReview: boolean): Observable<Policy> {
    return this.http.patch<Policy>(`${this.policiesUrl}/${encodeURIComponent(policyId)}`, { flaggedForReview }).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, 'update the review flag')),
    );
  }

  flagForReview(policyIds: readonly string[], flaggedForReview: boolean): Observable<readonly Policy[]> {
    if (policyIds.length === 0) {
      return forkJoin([] as Observable<Policy>[]);
    }
    return forkJoin(policyIds.map((id) => this.setFlaggedForReview(id, flaggedForReview)));
  }

  private buildParams(filter: PolicyFilter): HttpParams {
    const page = Math.max(0, Math.trunc(filter.page));
    const pageSize = Math.min(this.maxPageSize, Math.max(this.minPageSize, Math.trunc(filter.pageSize)));

    let params = new HttpParams().set('_page', String(page + 1)).set('_per_page', String(pageSize));

    if (filter.sortColumn && filter.sortDirection !== '') {
      const prefix = filter.sortDirection === 'desc' ? '-' : '';
      params = params.set('_sort', `${prefix}${filter.sortColumn}`);
    }

    const where = this.buildWhere(filter);
    if (where) {
      params = params.set('_where', JSON.stringify(where));
    }

    return params;
  }

  // json-server only ANDs flat query params, so every filter is expressed in a single
  // `_where` object: field criteria are ANDed, and free-text search is an OR of `contains`.
  private buildWhere(filter: PolicyFilter): WhereClause | null {
    const where: WhereClause = {};

    if (filter.status?.length) {
      where['status'] = { in: [...filter.status] };
    }
    if (filter.lineOfBusiness) {
      where['lineOfBusiness'] = { eq: filter.lineOfBusiness };
    }
    if (filter.region) {
      where['region'] = { eq: filter.region };
    }

    const start = filter.dateRange?.start;
    const end = filter.dateRange?.end;
    if (start || end) {
      where['effectiveDate'] = { ...(start ? { gte: start } : {}), ...(end ? { lte: end } : {}) };
    }

    const search = filter.search?.trim();
    if (search) {
      where['or'] = SEARCH_FIELDS.map((field) => ({ [field]: { contains: search } }));
    }

    return Object.keys(where).length > 0 ? where : null;
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
