import { TestBed } from '@angular/core/testing';
import { checkA11y } from '../../../../testing/a11y';
import { ErrorStateComponent } from './error-state.component';

describe('ErrorStateComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ErrorStateComponent] }).compileComponents();
  });

  function render(message = 'Something went wrong on our end. Please try again shortly.') {
    const fixture = TestBed.createComponent(ErrorStateComponent);
    fixture.componentRef.setInput('message', message);
    fixture.detectChanges();
    return fixture;
  }

  it('shows the message and error icon with role="alert"', () => {
    const fixture = render('Failed to load policies. Check your connection and try again.');
    const root = fixture.nativeElement.querySelector('.error-state') as HTMLElement;
    expect(root.getAttribute('role')).toBe('alert');
    expect(fixture.nativeElement.querySelector('mat-icon')?.textContent).toContain('error_outline');
    expect(fixture.nativeElement.querySelector('.error-state__message')?.textContent).toContain(
      'Failed to load policies',
    );
  });

  it('shows the retry button by default and hides it when disabled', () => {
    const fixture = render();
    expect(fixture.nativeElement.querySelector('button')).not.toBeNull();

    fixture.componentRef.setInput('showRetry', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('emits retry when the retry button is pressed', () => {
    const fixture = render();

    let emitted = false;
    fixture.componentInstance.retry.subscribe(() => (emitted = true));
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();

    expect(emitted).toBe(true);
  });

  it('has no WCAG 2.1 AA accessibility violations', async () => {
    const fixture = render();
    expect(await checkA11y(fixture.nativeElement)).toHaveNoViolations();
  });
});
