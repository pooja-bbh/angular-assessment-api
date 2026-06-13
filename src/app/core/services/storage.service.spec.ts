import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { LoggingService } from './logging.service';
import { StorageKey, StorageService } from './storage.service';

/**
 * StorageService is tested against a mock `localStorage` (never the real browser
 * storage), including the quota-exceeded path via a `DOMException` on write (testing.md).
 */
describe('StorageService', () => {
  let backingStore: Record<string, string>;
  let mockStorage: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
  };
  let logger: { debug: ReturnType<typeof vi.fn>; info: ReturnType<typeof vi.fn>; warn: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let service: StorageService;

  beforeEach(() => {
    backingStore = {};
    mockStorage = {
      getItem: vi.fn((key: string) => (key in backingStore ? backingStore[key] : null)),
      setItem: vi.fn((key: string, value: string) => {
        backingStore[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete backingStore[key];
      }),
    };
    vi.stubGlobal('localStorage', mockStorage);

    logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    TestBed.configureTestingModule({ providers: [{ provide: LoggingService, useValue: logger }] });
    service = TestBed.inject(StorageService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('serialises and stores a value, returning true', () => {
    expect(service.set(StorageKey.ThemePreference, 'dark')).toBe(true);
    expect(mockStorage.setItem).toHaveBeenCalledWith(StorageKey.ThemePreference, JSON.stringify('dark'));
  });

  it('reads and parses a stored value', () => {
    backingStore[StorageKey.ThemePreference] = JSON.stringify('light');
    expect(service.get<string>(StorageKey.ThemePreference)).toBe('light');
  });

  it('returns null for a missing key', () => {
    expect(service.get(StorageKey.PolicyFilters)).toBeNull();
  });

  it('returns null and logs a warning when stored JSON is malformed', () => {
    backingStore[StorageKey.ThemePreference] = '{ not valid json';
    expect(service.get(StorageKey.ThemePreference)).toBeNull();
    expect(logger.warn).toHaveBeenCalled();
  });

  it('returns false and logs a warning when the quota is exceeded on write', () => {
    mockStorage.setItem.mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    expect(service.set(StorageKey.ThemePreference, 'dark')).toBe(false);
    expect(logger.warn).toHaveBeenCalled();
  });

  it('removes a key', () => {
    backingStore[StorageKey.ThemePreference] = JSON.stringify('dark');
    service.remove(StorageKey.ThemePreference);
    expect(mockStorage.removeItem).toHaveBeenCalledWith(StorageKey.ThemePreference);
    expect(service.get(StorageKey.ThemePreference)).toBeNull();
  });

  it('swallows and logs a warning when removal throws', () => {
    mockStorage.removeItem.mockImplementation(() => {
      throw new DOMException('Removal failed');
    });
    expect(() => service.remove(StorageKey.ThemePreference)).not.toThrow();
    expect(logger.warn).toHaveBeenCalled();
  });
});
