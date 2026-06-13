import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AppError } from '../../core/models/app-error.model';
import { PolicyStats } from '../../core/models/policy.model';
import { PolicyService } from '../../core/services/policy.service';
import { PolicyStatsComponent } from './policy-stats.component';

const STATS: PolicyStats = {
  countByStatus: { Active: 10, Expired: 5, Pending: 3, Cancelled: 2 },
  totalPremiumByLob: { Property: 1000, Casualty: 2000, 'A&H': 500, Marine: 750 },
  expiringWithin30Days: 4,
};

describe('PolicyStatsComponent', () => {
  let getStats: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    getStats = vi.fn();
  });

  function setup() {
    TestBed.configureTestingModule({
      imports: [PolicyStatsComponent],
      providers: [{ provide: PolicyService, useValue: { getStats } }],
    });
    const fixture = TestBed.createComponent(PolicyStatsComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('shows skeleton cards while loading', () => {
    getStats.mockReturnValue(new Subject<PolicyStats>());
    const fixture = setup();
    expect(fixture.componentInstance.loadState().status).toBe('loading');
    expect(fixture.nativeElement.querySelectorAll('.policy-stats__card--skeleton').length).toBeGreaterThan(0);
  });

  it('renders a card per status and line of business plus the expiring card on success', () => {
    getStats.mockReturnValue(of(STATS));
    const fixture = setup();
    expect(fixture.componentInstance.loadState().status).toBe('success');
    // 4 statuses + 4 lines of business + 1 expiring = 9 cards.
    expect(fixture.nativeElement.querySelectorAll('.policy-stats__card').length).toBe(9);
    expect(fixture.nativeElement.textContent).toContain('10');
  });

  it('highlights the expiring card when the count is greater than zero', () => {
    getStats.mockReturnValue(of(STATS));
    const fixture = setup();
    expect(fixture.nativeElement.querySelector('.policy-stats__card--warning')).not.toBeNull();
  });

  it('gives each stat card a descriptive aria-label', () => {
    getStats.mockReturnValue(of(STATS));
    const fixture = setup();
    const card = fixture.nativeElement.querySelector('.policy-stats__card') as HTMLElement;
    expect(card.getAttribute('aria-label')).toContain('Active');
  });

  it('shows a small inline error (not blocking the grid) when the stats request fails', () => {
    const error: AppError = { code: 'SERVER_ERROR', message: 'Stats unavailable', statusCode: 500 };
    getStats.mockReturnValue(throwError(() => error));
    const fixture = setup();
    const alert = fixture.nativeElement.querySelector('.policy-stats__error') as HTMLElement | null;
    expect(alert?.getAttribute('role')).toBe('alert');
    expect(alert?.textContent).toContain('Stats unavailable');
    expect(fixture.nativeElement.querySelector('.policy-stats__grid')).toBeNull();
  });
});
