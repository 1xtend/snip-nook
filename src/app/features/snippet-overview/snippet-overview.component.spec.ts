import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnippetOverviewComponent } from './snippet-overview.component';

describe('SnippetOverviewComponent', () => {
  let component: SnippetOverviewComponent;
  let fixture: ComponentFixture<SnippetOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnippetOverviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SnippetOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
