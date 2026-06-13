import { TestBed } from '@angular/core/testing';
import { MatTooltip } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { checkA11y } from '../../../../testing/a11y';
import { ExpiryIndicatorComponent } from './expiry-indicator.component';

describe('ExpiryIndicatorComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ExpiryIndicatorComponent] }).compileComponents();
  });

  function render(isExpiringSoon: boolean, expiryDate: Date) {
    const fixture = TestBed.createComponent(ExpiryIndicatorComponent);
    fixture.componentRef.setInput('isExpiringSoon', isExpiringSoon);
    fixture.componentRef.setInput('expiryDate', expiryDate);
    fixture.detectChanges();
    return fixture;
  }

  it('renders a warning icon with an aria-label when expiring soon', () => {
    const fixture = render(true, new Date('2026-07-01'));
    const icon = fixture.nativeElement.querySelector('mat-icon') as HTMLElement | null;
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute('aria-label')).toBe('Expiring soon');
    expect(icon?.getAttribute('aria-hidden')).toBe('false');
  });

  it('provides a tooltip showing the expiry date', () => {
    const fixture = render(true, new Date('2026-07-01'));
    const tooltip = fixture.debugElement.query(By.directive(MatTooltip)).injector.get(MatTooltip);
    expect(tooltip.message).toContain('2026');
  });

  it('renders nothing when not expiring soon', () => {
    const fixture = render(false, new Date('2026-07-01'));
    expect(fixture.nativeElement.querySelector('mat-icon')).toBeNull();
    expect((fixture.nativeElement.textContent ?? '').trim()).toBe('');
  });

  it('has no WCAG 2.1 AA accessibility violations', async () => {
    const fixture = render(true, new Date('2026-07-01'));
    expect(await checkA11y(fixture.nativeElement)).toHaveNoViolations();
  });
});
