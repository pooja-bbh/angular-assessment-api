import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, RendererFactory2, signal } from '@angular/core';
import { StorageKey, StorageService } from './storage.service';

/** The two colour themes the dashboard supports. */
export type Theme = 'light' | 'dark';

/**
 * Owns the active colour theme as a signal and keeps the `<body>` theme class
 * and persisted preference in sync.
 *
 * DOM is mutated only through Angular's `Renderer2` (never `document.body.classList`
 * directly) per the services rules. The preference is a non-sensitive UI value, so
 * persisting it via `StorageService` is permitted.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(StorageService);
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(RendererFactory2).createRenderer(null, null);

  private readonly currentTheme = signal<Theme>(this.resolveInitialTheme());

  /** The active theme as a read-only signal. */
  readonly theme = this.currentTheme.asReadonly();
  /** Convenience derived signal for binding dark-mode UI. */
  readonly isDark = computed(() => this.currentTheme() === 'dark');

  constructor() {
    // Reflect every theme change to the DOM and storage; runs once on init too.
    effect(() => this.applyTheme(this.currentTheme()));
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }

  toggle(): void {
    this.currentTheme.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
  }

  private applyTheme(theme: Theme): void {
    const body = this.document.body;
    this.renderer.removeClass(body, 'theme-light');
    this.renderer.removeClass(body, 'theme-dark');
    this.renderer.addClass(body, `theme-${theme}`);
    this.storage.set(StorageKey.ThemePreference, theme);
  }

  private resolveInitialTheme(): Theme {
    const stored = this.storage.get<Theme>(StorageKey.ThemePreference);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    const prefersDark = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches ?? false;
    return prefersDark ? 'dark' : 'light';
  }
}
