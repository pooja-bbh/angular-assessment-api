import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, RendererFactory2, signal } from '@angular/core';
import { StorageKey, StorageService } from './storage.service';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(StorageService);
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(RendererFactory2).createRenderer(null, null);

  private readonly currentTheme = signal<Theme>(this.resolveInitialTheme());

  readonly theme = this.currentTheme.asReadonly();
  readonly isDark = computed(() => this.currentTheme() === 'dark');

  constructor() {
    effect(() => this.applyTheme(this.currentTheme()));
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }

  toggleTheme(): void {
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
    const view = this.document.defaultView;
    if (view && typeof view.matchMedia === 'function') {
      return view.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
}
