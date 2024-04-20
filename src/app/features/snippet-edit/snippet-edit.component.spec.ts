import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnippetEditComponent } from './snippet-edit.component';

describe('SnippetEditComponent', () => {
  let component: SnippetEditComponent;
  let fixture: ComponentFixture<SnippetEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnippetEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SnippetEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
