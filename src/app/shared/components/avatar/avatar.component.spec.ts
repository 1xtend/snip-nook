import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarButtonComponent } from './avatar-button.component';

describe('AvatarButtonComponent', () => {
  let component: AvatarButtonComponent;
  let fixture: ComponentFixture<AvatarButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AvatarButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
