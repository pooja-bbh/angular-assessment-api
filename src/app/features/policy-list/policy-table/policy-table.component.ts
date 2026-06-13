import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
  WritableSignal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, merge, of, startWith, Subject, switchMap } from 'rxjs';
import { AppError } from '../../../core/models/app-error.model';
import { LoadState } from '../../../core/models/load-state.model';
import { POLICY_SORT_COLUMNS } from '../../../core/models/policy.constants';
import { Policy, PolicyPage, PolicySortColumn } from '../../../core/models/policy.model';
import { PolicyFilterStore } from '../../../core/services/policy-filter.store';
import { PolicyService } from '../../../core/services/policy.service';
import { BulkActionToolbarComponent } from '../../bulk-actions/bulk-action-toolbar/bulk-action-toolbar.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

const SNACKBAR_DURATION_MS = 7000;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

@Component({
  selector: 'app-policy-table',
  imports: [
    CurrencyPipe,
    DatePipe,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    SkeletonLoaderComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    BulkActionToolbarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './policy-table.component.html',
  styleUrl: './policy-table.component.scss',
})
export class PolicyTableComponent {
  private readonly policyService = inject(PolicyService);
  protected readonly filterStore = inject(PolicyFilterStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly displayedColumns = [
    'select',
    'policyNumber',
    'policyholderName',
    'region',
    'lineOfBusiness',
    'status',
    'premiumAmount',
    'expiryDate',
    'actions',
  ];
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;

  readonly loadState: WritableSignal<LoadState<PolicyPage>>;

  private readonly reload$ = new Subject<void>();
  private readonly selectedIds = signal<ReadonlySet<string>>(new Set());

  protected readonly policies = computed<readonly Policy[]>(() => {
    const state = this.loadState();
    return state.status === 'success' ? state.data.content : [];
  });
  protected readonly totalElements = computed(() => {
    const state = this.loadState();
    return state.status === 'success' ? state.data.totalElements : 0;
  });
  protected readonly errorMessage = computed(() => {
    const state = this.loadState();
    return state.status === 'error' ? state.error.message : '';
  });

  protected readonly selectedPolicies = computed<readonly Policy[]>(() => {
    const ids = this.selectedIds();
    return this.policies().filter((policy) => ids.has(policy.id));
  });
  protected readonly selectedCount = computed(() => this.selectedPolicies().length);
  protected readonly isAllSelected = computed(() => {
    const ids = this.selectedIds();
    const rows = this.policies();
    return rows.length > 0 && rows.every((row) => ids.has(row.id));
  });
  protected readonly isPartiallySelected = computed(() => this.selectedCount() > 0 && !this.isAllSelected());

  constructor() {
    this.filterStore.initFromUrl(this.route.snapshot.queryParams);

    const trigger$ = merge(
      toObservable(this.filterStore.queryParams),
      this.reload$.pipe(map(() => this.filterStore.queryParams())),
    );

    const serverState = toSignal(
      trigger$.pipe(
        switchMap((params) =>
          this.policyService.getPolicies(params).pipe(
            map((page): LoadState<PolicyPage> => LoadState.success(page)),
            startWith<LoadState<PolicyPage>>(LoadState.loading()),
            catchError((error: AppError) => of<LoadState<PolicyPage>>(LoadState.error(error))),
          ),
        ),
      ),
      { initialValue: LoadState.idle() as LoadState<PolicyPage> },
    );

    this.loadState = linkedSignal<LoadState<PolicyPage>>(() => serverState());

    effect(() => {
      serverState();
      this.selectedIds.set(new Set());
    });

    effect(() => {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          page: this.filterStore.page(),
          size: this.filterStore.pageSize(),
          sort: this.filterStore.sortColumn(),
          dir: this.filterStore.sortDirection() || null,
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }

  onSortChange(sort: Sort): void {
    if ((POLICY_SORT_COLUMNS as readonly string[]).includes(sort.active)) {
      this.filterStore.setSort(sort.active as PolicySortColumn, sort.direction);
    }
  }

  onPageChange(event: PageEvent): void {
    if (event.pageSize !== this.filterStore.pageSize()) {
      this.filterStore.setPageSize(event.pageSize);
    } else {
      this.filterStore.setPage(event.pageIndex);
    }
  }

  onRetry(): void {
    this.reload$.next();
  }

  onClearFilters(): void {
    this.filterStore.clearFilters();
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  toggleAll(): void {
    if (this.isAllSelected()) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(this.policies().map((policy) => policy.id)));
    }
  }

  toggleRow(policy: Policy): void {
    this.selectedIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(policy.id)) {
        next.delete(policy.id);
      } else {
        next.add(policy.id);
      }
      return next;
    });
  }

  isSelected(policy: Policy): boolean {
    return this.selectedIds().has(policy.id);
  }

  onBulkFlagForReview(): void {
    this.flagPolicies(this.selectedPolicies().map((policy) => policy.id));
  }

  onFlagRow(policy: Policy): void {
    this.flagPolicies([policy.id]);
  }

  private flagPolicies(policyIds: readonly string[]): void {
    const state = this.loadState();
    if (state.status !== 'success' || policyIds.length === 0) {
      return;
    }
    const targetIds = new Set(policyIds);
    const previousPage = state.data;
    const optimisticPage: PolicyPage = {
      ...previousPage,
      content: previousPage.content.map((policy) =>
        targetIds.has(policy.id) ? { ...policy, flaggedForReview: true } : policy,
      ),
    };

    this.loadState.set(LoadState.success(optimisticPage));
    this.clearSelection();

    this.policyService.flagForReview(policyIds, true).subscribe({
      error: (error: AppError) => {
        this.loadState.set(LoadState.success(previousPage));
        this.snackBar.open(error.message, $localize`:@@snackbarDismiss:Dismiss`, { duration: SNACKBAR_DURATION_MS });
      },
    });
  }
}
