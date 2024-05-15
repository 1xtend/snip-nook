import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnippetActionComponent } from './snippet-action.component';

describe('SnippetActionComponent', () => {
  let component: SnippetActionComponent;
  let fixture: ComponentFixture<SnippetActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnippetActionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SnippetActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
