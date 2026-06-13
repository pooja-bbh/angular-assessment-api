import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { HeaderComponent } from './layout/header/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly theme = inject(ThemeService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  constructor() {
    effect(() => {
      const theme = this.theme.theme();
      const element = this.host.nativeElement;
      this.renderer.removeClass(element, 'theme-light');
      this.renderer.removeClass(element, 'theme-dark');
      this.renderer.addClass(element, `theme-${theme}`);
    });
  }
}
