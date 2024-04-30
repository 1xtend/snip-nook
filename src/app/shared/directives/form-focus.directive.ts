import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[focusInvalidInput]',
  standalone: true,
})
export class FormFocusDirective {
  private el = inject(ElementRef<HTMLFormElement>);

  @HostListener('submit') onSubmit(): void {
    const invalidControl = this.el.nativeElement.querySelector(
      '.ng-invalid',
    ) as HTMLInputElement;

    if (invalidControl) {
      invalidControl.focus();
    }
  }
}
