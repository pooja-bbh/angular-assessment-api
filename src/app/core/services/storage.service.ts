import { inject, Injectable } from '@angular/core';
import { LoggingService } from './logging.service';

export const StorageKey = {
  ThemePreference: 'chubb.theme-preference',
  PolicyFilters: 'chubb.policy-filters',
} as const;

export type StorageKeyValue = (typeof StorageKey)[keyof typeof StorageKey];

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly logger = inject(LoggingService);
  private readonly context = 'StorageService';

  get<T>(key: StorageKeyValue): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? null : (JSON.parse(raw) as T);
    } catch (error: unknown) {
      this.logger.warn(this.context, `Failed to read storage key "${key}"`, this.describe(error));
      return null;
    }
  }

  set<T>(key: StorageKeyValue, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error: unknown) {
      this.logger.warn(this.context, `Failed to write storage key "${key}"`, this.describe(error));
      return false;
    }
  }

  remove(key: StorageKeyValue): void {
    try {
      localStorage.removeItem(key);
    } catch (error: unknown) {
      this.logger.warn(this.context, `Failed to remove storage key "${key}"`, this.describe(error));
    }
  }

  private describe(error: unknown): string {
    return error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown storage error';
  }
}
