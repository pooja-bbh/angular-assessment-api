import { CurrencyPipe, formatCurrency } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, LOCALE_ID, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Subscription } from 'rxjs';
import { AppError } from '../../core/models/app-error.model';
import { LoadState } from '../../core/models/load-state.model';
import { LINES_OF_BUSINESS, POLICY_STATUSES } from '../../core/models/policy.constants';
import { LineOfBusiness, PolicyStats, PolicyStatus } from '../../core/models/policy.model';
import { PolicyFilterStore } from '../../core/services/policy-filter.store';
import { PolicyService } from '../../core/services/policy.service';

const DISPLAY_CURRENCY = 'USD';
const SKELETON_CARD_COUNT = POLICY_STATUSES.length + LINES_OF_BUSINESS.length + 1;

interface StatusCard {
  readonly status: PolicyStatus;
  readonly count: number;
  readonly ariaLabel: string;
}

interface LobCard {
  readonly lob: LineOfBusiness;
  readonly total: number;
  readonly ariaLabel: string;
}

interface ExpiringCard {
  readonly count: number;
  readonly ariaLabel: string;
}

@Component({
  selector: 'app-policy-stats',
  imports: [CurrencyPipe, MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="policy-stats"
      i18n-aria-label="@@statsRegionAria"
      aria-label="Policy statistics"
      [attr.aria-busy]="loadState().status === 'loading'"
    >
      @switch (loadState().status) {
        @case ('loading') {
          <div
            class="policy-stats__grid"
            role="status"
            i18n-aria-label="@@statsLoadingAria"
            aria-label="Loading statistics"
          >
            @for (placeholder of skeletonCards; track $index) {
              <mat-card class="policy-stats__card policy-stats__card--skeleton" aria-hidden="true">
                <span class="policy-stats__bar"></span>
                <span class="policy-stats__bar policy-stats__bar--value"></span>
              </mat-card>
            }
          </div>
        }

        @case ('error') {
          <p class="policy-stats__error" role="alert">{{ errorMessage() }}</p>
        }

        @case ('success') {
          <div class="policy-stats__grid">
            @for (card of statusCards(); track card.status) {
              <mat-card class="policy-stats__card" [attr.aria-label]="card.ariaLabel">
                <span class="policy-stats__label">{{ card.status }}</span>
                <span class="policy-stats__value">{{ card.count }}</span>
              </mat-card>
            }

            @for (card of lobCards(); track card.lob) {
              <mat-card class="policy-stats__card" [attr.aria-label]="card.ariaLabel">
                <span class="policy-stats__label">{{ card.lob }}</span>
                <span class="policy-stats__value">{{ card.total | currency: displayCurrency }}</span>
              </mat-card>
            }

            <mat-card
              class="policy-stats__card"
              [class.policy-stats__card--warning]="isExpiringHighlighted()"
              [attr.aria-label]="expiringCard().ariaLabel"
            >
              <span class="policy-stats__label" i18n="@@statExpiringLabel">Expiring within 30 days</span>
              <span class="policy-stats__value">{{ expiringCard().count }}</span>
            </mat-card>
          </div>
        }
      }
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .policy-stats__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
        gap: var(--spacing-md);
      }

      .policy-stats__card {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
        padding: var(--spacing-md);
      }

      .policy-stats__label {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        opacity: 0.75;
      }

      .policy-stats__value {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
      }

      .policy-stats__card--warning {
        border-inline-start: var(--spacing-xs) solid var(--color-warning);
      }

      .policy-stats__card--warning .policy-stats__value {
        color: var(--color-warning);
      }

      .policy-stats__error {
        margin: 0;
        padding: var(--spacing-sm) var(--spacing-md);
        color: var(--color-error);
        font-size: var(--font-size-sm);
      }

      .policy-stats__bar {
        height: var(--spacing-md);
        border-radius: var(--radius-sm);
        background: var(--color-surface-variant);
        animation: policy-stats-pulse 1.5s ease-in-out infinite;
      }

      .policy-stats__bar--value {
        width: 60%;
      }

      @keyframes policy-stats-pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.4;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .policy-stats__bar {
          animation: none;
        }
      }

      @media (max-width: 1023px) {
        .policy-stats__grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class PolicyStatsComponent {
  private readonly policyService = inject(PolicyService);
  private readonly filterStore = inject(PolicyFilterStore);
  private readonly locale = inject(LOCALE_ID);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly displayCurrency = DISPLAY_CURRENCY;
  protected readonly skeletonCards = Array.from({ length: SKELETON_CARD_COUNT });

  private readonly loadStateSignal = signal<LoadState<PolicyStats>>(LoadState.idle());
  readonly loadState = this.loadStateSignal.asReadonly();

  private statsSubscription: Subscription | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.statsSubscription?.unsubscribe());

    effect(() => {
      this.filterStore.queryParams();
      this.fetchStats();
    });
  }

  protected readonly errorMessage = computed(() => {
    const state = this.loadState();
    return state.status === 'error' ? state.error.message : '';
  });

  protected readonly statusCards = computed<readonly StatusCard[]>(() => {
    const state = this.loadState();
    if (state.status !== 'success') {
      return [];
    }
    const counts = state.data.countByStatus;
    return POLICY_STATUSES.map((status) => ({
      status,
      count: counts[status],
      ariaLabel: $localize`:@@statStatusCardAria:${counts[status]}:count: ${status}:status: policies`,
    }));
  });

  protected readonly lobCards = computed<readonly LobCard[]>(() => {
    const state = this.loadState();
    if (state.status !== 'success') {
      return [];
    }
    const totals = state.data.totalPremiumByLob;
    return LINES_OF_BUSINESS.map((lob) => {
      const total = totals[lob];
      const amount = formatCurrency(total, this.locale, '$', DISPLAY_CURRENCY);
      return {
        lob,
        total,
        ariaLabel: $localize`:@@statLobCardAria:Total ${lob}:lob: premium ${amount}:amount:`,
      };
    });
  });

  protected readonly expiringCard = computed<ExpiringCard>(() => {
    const state = this.loadState();
    const count = state.status === 'success' ? state.data.expiringWithin30Days : 0;
    return {
      count,
      ariaLabel: $localize`:@@statExpiringCardAria:${count}:count: policies expiring within 30 days`,
    };
  });

  protected readonly isExpiringHighlighted = computed(() => this.expiringCard().count > 0);

  private fetchStats(): void {
    this.statsSubscription?.unsubscribe();
    this.loadStateSignal.set(LoadState.loading());
    this.statsSubscription = this.policyService.getStats().subscribe({
      next: (stats) => this.loadStateSignal.set(LoadState.success(stats)),
      error: (error: AppError) => this.loadStateSignal.set(LoadState.error(error)),
    });
  }
}
