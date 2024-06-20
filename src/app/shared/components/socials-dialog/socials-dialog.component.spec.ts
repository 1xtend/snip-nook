import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialsDialogComponent } from './socials-dialog.component';

describe('SocialsDialogComponent', () => {
  let component: SocialsDialogComponent;
  let fixture: ComponentFixture<SocialsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SocialsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
