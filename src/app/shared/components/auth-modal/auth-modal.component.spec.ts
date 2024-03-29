import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthModalComponent } from './auth-modal.component';

describe('AuthModalComponent', () => {
  let component: AuthModalComponent;
  let fixture: ComponentFixture<AuthModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthModalComponent);
    component = fixture.componentInstance;

    component.visible = false;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit closeModal on onVisibleChange', () => {
    const closeSpy = jest.spyOn(component.closeModal, 'emit');

    component.onVisibleChange(false);

    expect(closeSpy).toHaveBeenCalled();
  });
});
