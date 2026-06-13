import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ThemeService } from '../../core/services/theme.service';

/**
 * Application header: product title and a light/dark theme toggle.
 *
 * The toggle's `aria-label` describes the current theme and the action clicking
 * performs (accessibility.md); the icon reflects the theme it will switch to.
 */
@Component({
  selector: 'app-header',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-toolbar class="header" color="primary">
      <span class="header__title" i18n="@@appTitle">Chubb APAC | Policy Dashboard</span>
      <span class="header__spacer"></span>
      <button mat-icon-button type="button" (click)="theme.toggleTheme()" [attr.aria-label]="toggleLabel()">
        @if (theme.isDark()) {
          <mat-icon>light_mode</mat-icon>
        } @else {
          <mat-icon>dark_mode</mat-icon>
        }
      </button>
    </mat-toolbar>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .header__title {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-medium);
      }

      .header__spacer {
        flex: 1 1 auto;
      }
    `,
  ],
})
export class HeaderComponent {
  protected readonly theme = inject(ThemeService);

  // Announces the current state and the result of activating the toggle.
  protected readonly toggleLabel = computed(() =>
    this.theme.isDark()
      ? $localize`:@@themeToggleToLight:Dark theme on. Switch to light theme`
      : $localize`:@@themeToggleToDark:Light theme on. Switch to dark theme`,
  );
}
