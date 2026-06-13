import { TestBed } from '@angular/core/testing';
import { checkA11y } from '../../../../testing/a11y';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EmptyStateComponent] }).compileComponents();
  });

  it('shows the default message and inbox icon with role="status"', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('.empty-state') as HTMLElement;
    expect(root.getAttribute('role')).toBe('status');
    expect(fixture.nativeElement.querySelector('mat-icon')?.textContent).toContain('inbox');
    expect(fixture.nativeElement.querySelector('.empty-state__message')?.textContent).toContain('No policies found');
  });

  it('renders a custom message', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('message', 'Nothing to display');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty-state__message')?.textContent).toContain('Nothing to display');
  });

  it('hides the CTA by default and shows it when enabled', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();

    fixture.componentRef.setInput('showCta', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).not.toBeNull();
  });

  it('emits ctaClick when the CTA is pressed', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('showCta', true);
    fixture.detectChanges();

    let emitted = false;
    fixture.componentInstance.ctaClick.subscribe(() => (emitted = true));
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();

    expect(emitted).toBe(true);
  });

  it('has no WCAG 2.1 AA accessibility violations', async () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('showCta', true);
    fixture.detectChanges();
    expect(await checkA11y(fixture.nativeElement)).toHaveNoViolations();
  });
});
