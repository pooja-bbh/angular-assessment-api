import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AppError } from '../../../core/models/app-error.model';
import { LoadState } from '../../../core/models/load-state.model';
import { Policy, PolicyPage } from '../../../core/models/policy.model';
import { PolicyService } from '../../../core/services/policy.service';
import { PolicyTableComponent } from './policy-table.component';

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

function makePage(content: Policy[]): PolicyPage {
  return { content, page: 0, size: 20, totalElements: content.length, totalPages: 1 };
}

function contentOf(state: LoadState<PolicyPage>): readonly Policy[] {
  return state.status === 'success' ? state.data.content : [];
}

describe('PolicyTableComponent', () => {
  let getPolicies: ReturnType<typeof vi.fn>;
  let flagForReview: ReturnType<typeof vi.fn>;
  let snackBarOpen: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    getPolicies = vi.fn();
    flagForReview = vi.fn();
    snackBarOpen = vi.fn();
  });

  function setup() {
    TestBed.configureTestingModule({
      imports: [PolicyTableComponent],
      providers: [
        { provide: PolicyService, useValue: { getPolicies, flagForReview } },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } },
        { provide: MatSnackBar, useValue: { open: snackBarOpen } },
      ],
    });
    const fixture = TestBed.createComponent(PolicyTableComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('shows the skeleton loader while loading', () => {
    getPolicies.mockReturnValue(new Subject<PolicyPage>());
    const fixture = setup();
    expect(fixture.componentInstance.loadState().status).toBe('loading');
    expect(fixture.nativeElement.querySelector('app-skeleton-loader')).not.toBeNull();
  });

  it('renders the table with a row per policy on success', () => {
    getPolicies.mockReturnValue(of(makePage([makePolicy('1'), makePolicy('2')])));
    const fixture = setup();
    expect(fixture.componentInstance.loadState().status).toBe('success');
    expect(fixture.nativeElement.querySelector('table[mat-table]')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('tr[mat-row]').length).toBe(2);
  });

  it('shows the empty state (and no table) when there are no policies', () => {
    getPolicies.mockReturnValue(of(makePage([])));
    const fixture = setup();
    expect(fixture.nativeElement.querySelector('app-empty-state')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('table[mat-table]')).toBeNull();
  });

  it('shows the error state on a failed request', () => {
    const error: AppError = { code: 'SERVER_ERROR', message: 'Boom', statusCode: 500 };
    getPolicies.mockReturnValue(throwError(() => error));
    const fixture = setup();
    expect(fixture.componentInstance.loadState().status).toBe('error');
    expect(fixture.nativeElement.querySelector('app-error-state')).not.toBeNull();
  });

  it('re-fetches and recovers when retry is triggered', () => {
    const error: AppError = { code: 'NETWORK', message: 'Offline', statusCode: 0 };
    getPolicies.mockReturnValueOnce(throwError(() => error)).mockReturnValue(of(makePage([makePolicy('1')])));
    const fixture = setup();
    expect(fixture.componentInstance.loadState().status).toBe('error');

    (fixture.nativeElement.querySelector('app-error-state button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.loadState().status).toBe('success');
    expect(fixture.nativeElement.querySelector('table[mat-table]')).not.toBeNull();
  });

  it('optimistically flags selected policies, calls the API, and reverts on error', () => {
    const page = makePage([makePolicy('1'), makePolicy('2')]);
    getPolicies.mockReturnValue(of(page));
    const flagResult$ = new Subject<readonly Policy[]>();
    flagForReview.mockReturnValue(flagResult$);

    const fixture = setup();
    const component = fixture.componentInstance;

    component.toggleRow(page.content[0]);
    component.onBulkFlagForReview();

    // Signal updates immediately and the API is called.
    expect(contentOf(component.loadState())[0].flaggedForReview).toBe(true);
    expect(flagForReview).toHaveBeenCalledWith(['1'], true);

    // On API error the signal reverts and a snackbar is shown.
    flagResult$.error({ code: 'SERVER_ERROR', message: 'Update failed', statusCode: 500 } satisfies AppError);
    expect(contentOf(component.loadState())[0].flaggedForReview).toBe(false);
    expect(snackBarOpen).toHaveBeenCalled();
  });
});
