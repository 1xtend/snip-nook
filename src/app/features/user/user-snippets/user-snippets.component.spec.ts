import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSnippetsComponent } from './user-snippets.component';

describe('UserSnippetsComponent', () => {
  let component: UserSnippetsComponent;
  let fixture: ComponentFixture<UserSnippetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSnippetsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserSnippetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
