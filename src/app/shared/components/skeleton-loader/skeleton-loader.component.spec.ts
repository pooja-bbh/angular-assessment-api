import { TestBed } from '@angular/core/testing';
import { checkA11y } from '../../../../testing/a11y';
import { SkeletonLoaderComponent } from './skeleton-loader.component';

describe('SkeletonLoaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SkeletonLoaderComponent] }).compileComponents();
  });

  function rowCount(fixture: { nativeElement: HTMLElement }): number {
    return fixture.nativeElement.querySelectorAll('.skeleton__row').length;
  }

  it('renders 5 placeholder rows by default', () => {
    const fixture = TestBed.createComponent(SkeletonLoaderComponent);
    fixture.detectChanges();
    expect(rowCount(fixture)).toBe(5);
  });

  it('renders the requested number of rows', () => {
    const fixture = TestBed.createComponent(SkeletonLoaderComponent);
    fixture.componentRef.setInput('rows', 3);
    fixture.detectChanges();
    expect(rowCount(fixture)).toBe(3);
  });

  it('exposes role="status" and a loading label for screen readers', () => {
    const fixture = TestBed.createComponent(SkeletonLoaderComponent);
    fixture.detectChanges();
    const container = fixture.nativeElement.querySelector('.skeleton') as HTMLElement;
    expect(container.getAttribute('role')).toBe('status');
    expect(container.getAttribute('aria-label')).toBe('Loading policies');
    expect(container.getAttribute('aria-busy')).toBe('true');
  });

  it('has no WCAG 2.1 AA accessibility violations', async () => {
    const fixture = TestBed.createComponent(SkeletonLoaderComponent);
    fixture.detectChanges();
    expect(await checkA11y(fixture.nativeElement)).toHaveNoViolations();
  });
});
