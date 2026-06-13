import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, LOCALE_ID, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, distinctUntilChanged, merge } from 'rxjs';
import { LINES_OF_BUSINESS, POLICY_REGIONS, POLICY_STATUSES } from '../../../core/models/policy.constants';
import { LineOfBusiness, PolicyFilter, PolicyRegion, PolicyStatus } from '../../../core/models/policy.model';

/** Free-text search must never fire per-keystroke — debounce before emitting. */
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Dumb filter bar for the policy list.
 *
 * Receives the current filter state via `currentFilters` and emits granular
 * `filterChange` patches (and `resetFilters`) — it owns no service state. Search
 * input is debounced 300ms via RxJS before emitting. All controls are Material
 * form fields with `mat-label`s (never placeholder-only) and are keyboard
 * accessible; visible labels carry `i18n` markers.
 */
@Component({
  selector: 'app-policy-filter-bar',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
  ],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './policy-filter-bar.component.html',
  styleUrl: './policy-filter-bar.component.scss',
})
export class PolicyFilterBarComponent {
  readonly currentFilters = input.required<PolicyFilter>();

  readonly filterChange = output<Partial<PolicyFilter>>();
  readonly resetFilters = output<void>();

  // Option lists for the selects (sourced from the shared union allowlists).
  protected readonly statuses = POLICY_STATUSES;
  protected readonly linesOfBusiness = LINES_OF_BUSINESS;
  protected readonly regions = POLICY_REGIONS;

  // Public so the template binds it and specs can drive controls directly.
  readonly filterForm = new FormGroup({
    status: new FormControl<readonly PolicyStatus[]>([], { nonNullable: true }),
    lineOfBusiness: new FormControl<LineOfBusiness | null>(null),
    region: new FormControl<PolicyRegion | null>(null),
    search: new FormControl<string>('', { nonNullable: true }),
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  /** Drives the Clear Filters button — computed from the input, not the form. */
  readonly hasActiveFilters = computed<boolean>(() => {
    const filters = this.currentFilters();
    return Boolean(
      filters.status?.length ||
        filters.lineOfBusiness ||
        filters.region ||
        filters.search?.trim() ||
        filters.dateRange?.start ||
        filters.dateRange?.end,
    );
  });

  private readonly locale = inject(LOCALE_ID);

  constructor() {
    const controls = this.filterForm.controls;

    // Search: debounce keystrokes (300ms) and only emit when the term actually changes.
    controls.search.valueChanges
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => this.filterChange.emit({ search: this.normaliseSearch(value) }));

    // Selects emit immediately on change — no debounce needed for discrete choices.
    controls.status.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.filterChange.emit({ status: value.length ? value : undefined }));

    controls.lineOfBusiness.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.filterChange.emit({ lineOfBusiness: value ?? undefined }));

    controls.region.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.filterChange.emit({ region: value ?? undefined }));

    merge(controls.start.valueChanges, controls.end.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.emitDateRange());

    // Mirror external filter state into the form without re-triggering emissions.
    effect(() => {
      const filters = this.currentFilters();
      this.filterForm.setValue(
        {
          status: filters.status ? [...filters.status] : [],
          lineOfBusiness: filters.lineOfBusiness ?? null,
          region: filters.region ?? null,
          search: filters.search ?? '',
          start: filters.dateRange?.start ? new Date(filters.dateRange.start) : null,
          end: filters.dateRange?.end ? new Date(filters.dateRange.end) : null,
        },
        { emitEvent: false },
      );
    });
  }

  private emitDateRange(): void {
    const { start, end } = this.filterForm.getRawValue();
    this.filterChange.emit({ dateRange: { start: this.toIsoDate(start), end: this.toIsoDate(end) } });
  }

  private toIsoDate(date: Date | null): string | null {
    return date ? formatDate(date, 'yyyy-MM-dd', this.locale) : null;
  }

  private normaliseSearch(value: string): string | undefined {
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }
}
