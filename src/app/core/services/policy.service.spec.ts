import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AppError } from '../models/app-error.model';
import { Policy, PolicyFilter, PolicyPage } from '../models/policy.model';
import { LoggingService } from './logging.service';
import { PolicyService } from './policy.service';

const POLICIES_URL = 'http://localhost:3000/policies';

function makePolicy(id: string, flagged = false): Policy {
  return {
    id,
    policyNumber: `POL-${id}`,
    policyholderName: 'Test Holder',
    lineOfBusiness: 'Property',
    status: 'Active',
    premiumAmount: 1000,
    currency: 'SGD',
    effectiveDate: '2024-01-01',
    expiryDate: '2025-01-01',
    region: 'Singapore',
    underwriter: 'Underwriter',
    flaggedForReview: flagged,
  };
}

const FILTER: PolicyFilter = { page: 0, pageSize: 20, sortColumn: 'policyNumber', sortDirection: 'asc' };

describe('PolicyService', () => {
  let service: PolicyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: LoggingService,
          useValue: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        },
      ],
    });
    service = TestBed.inject(PolicyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('maps the json-server envelope to a PolicyPage on success', () => {
    let result: PolicyPage | undefined;
    service.getPolicies(FILTER).subscribe((page) => (result = page));

    const req = httpMock.expectOne((r) => r.url === POLICIES_URL);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [makePolicy('1')], items: 1, pages: 1 });

    expect(result).toEqual({
      content: [makePolicy('1')],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    });
  });

  it('builds a free-text search as a case-insensitive OR across policy number, holder, and underwriter', () => {
    service.getPolicies({ ...FILTER, search: 'nurul' }).subscribe();

    const req = httpMock.expectOne((r) => r.url === POLICIES_URL);
    const where: unknown = JSON.parse(req.request.params.get('_where') ?? '{}');
    expect(where).toEqual({
      or: [
        { policyNumber: { contains: 'nurul' } },
        { policyholderName: { contains: 'nurul' } },
        { underwriter: { contains: 'nurul' } },
      ],
    });
    expect(req.request.params.has('q')).toBe(false);
    req.flush({ data: [], items: 0, pages: 0 });
  });

  it('combines status, region, and date filters into a single _where clause', () => {
    service
      .getPolicies({
        ...FILTER,
        status: ['Active', 'Pending'],
        region: 'Singapore',
        dateRange: { start: '2025-01-01', end: '2025-12-31' },
      })
      .subscribe();

    const req = httpMock.expectOne((r) => r.url === POLICIES_URL);
    const where: unknown = JSON.parse(req.request.params.get('_where') ?? '{}');
    expect(where).toEqual({
      status: { in: ['Active', 'Pending'] },
      region: { eq: 'Singapore' },
      effectiveDate: { gte: '2025-01-01', lte: '2025-12-31' },
    });
    req.flush({ data: [], items: 0, pages: 0 });
  });

  it('omits the _where param when no filters are active', () => {
    service.getPolicies(FILTER).subscribe();

    const req = httpMock.expectOne((r) => r.url === POLICIES_URL);
    expect(req.request.params.has('_where')).toBe(false);
    req.flush({ data: [], items: 0, pages: 0 });
  });

  it('maps a 4xx response to a user-friendly AppError', () => {
    let error: AppError | undefined;
    service.getPolicies(FILTER).subscribe({ error: (e: AppError) => (error = e) });

    httpMock.expectOne((r) => r.url === POLICIES_URL).flush('Bad request', { status: 400, statusText: 'Bad Request' });

    expect(error?.code).toBe('BAD_REQUEST');
    expect(error?.message).toContain('adjust your filters');
  });

  it('maps a network error (status 0) to the NETWORK AppError', () => {
    let error: AppError | undefined;
    service.getPolicies(FILTER).subscribe({ error: (e: AppError) => (error = e) });

    httpMock.expectOne((r) => r.url === POLICIES_URL).error(new ProgressEvent('error'));

    expect(error?.code).toBe('NETWORK');
    expect(error?.message).toContain("Can't reach the server");
  });

  it('PATCHes each policy for flagForReview and returns the updated policies in order', () => {
    let result: readonly Policy[] | undefined;
    service.flagForReview(['1', '2'], true).subscribe((policies) => (result = policies));

    const req1 = httpMock.expectOne(`${POLICIES_URL}/1`);
    const req2 = httpMock.expectOne(`${POLICIES_URL}/2`);
    expect(req1.request.method).toBe('PATCH');
    expect(req1.request.body).toEqual({ flaggedForReview: true });

    req1.flush(makePolicy('1', true));
    req2.flush(makePolicy('2', true));

    expect(result).toEqual([makePolicy('1', true), makePolicy('2', true)]);
  });
});
