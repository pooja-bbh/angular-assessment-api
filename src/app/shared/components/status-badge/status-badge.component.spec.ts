import { TestBed } from '@angular/core/testing';
import { PolicyStatus } from '../../../core/models/policy.model';
import { checkA11y } from '../../../../testing/a11y';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StatusBadgeComponent] }).compileComponents();
  });

  function render(status: PolicyStatus): HTMLElement {
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentRef.setInput('status', status);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('.status-badge') as HTMLElement;
  }

  it('renders the status label as visible text', () => {
    expect(render('Active').textContent?.trim()).toContain('Active');
  });

  it('applies a status-driven modifier class', () => {
    expect(render('Pending').classList.contains('status-badge--pending')).toBe(true);
  });

  it('exposes an aria-label matching the status text', () => {
    expect(render('Cancelled').getAttribute('aria-label')).toBe('Cancelled');
  });

  it('always shows the text label (colour is not the sole indicator)', () => {
    const badge = render('Expired');
    expect(badge.querySelector('.status-badge__label')?.textContent?.trim()).toBe('Expired');
  });

  it('has no WCAG 2.1 AA accessibility violations', async () => {
    expect(await checkA11y(render('Active'))).toHaveNoViolations();
  });
});
