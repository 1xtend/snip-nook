import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnippetCreateComponent } from './snippet-create.component';

describe('SnippetCreateComponent', () => {
  let component: SnippetCreateComponent;
  let fixture: ComponentFixture<SnippetCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnippetCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SnippetCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
