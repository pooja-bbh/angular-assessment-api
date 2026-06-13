import { TestBed } from '@angular/core/testing';
import { BulkActionToolbarComponent } from './bulk-action-toolbar.component';

describe('BulkActionToolbarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BulkActionToolbarComponent] }).compileComponents();
  });

  function render(selectedCount: number) {
    const fixture = TestBed.createComponent(BulkActionToolbarComponent);
    fixture.componentRef.setInput('selectedCount', selectedCount);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the pluralised selected count', () => {
    const fixture = render(3);
    const text = (fixture.nativeElement.textContent ?? '').replace(/\s+/g, ' ').trim();
    expect(text).toContain('3 policies selected');
  });

  it('emits flagForReview when the flag button is pressed', () => {
    const fixture = render(2);
    let flagged = false;
    fixture.componentInstance.flagForReview.subscribe(() => (flagged = true));

    const buttons = fixture.nativeElement.querySelectorAll('button');
    (buttons[buttons.length - 1] as HTMLButtonElement).click();

    expect(flagged).toBe(true);
  });

  it('emits clearSelection when the clear button is pressed', () => {
    const fixture = render(2);
    let cleared = false;
    fixture.componentInstance.clearSelection.subscribe(() => (cleared = true));

    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();

    expect(cleared).toBe(true);
  });
});
