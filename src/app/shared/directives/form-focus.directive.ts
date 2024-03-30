import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[focusInvalidInput]',
  standalone: true,
})
export class FormFocusDirective {
  constructor(private el: ElementRef<HTMLFormElement>) {}

  @HostListener('submit') onSubmit(): void {
    const invalidControl = this.el.nativeElement.querySelector(
      '.ng-invalid',
    ) as HTMLInputElement;

    if (invalidControl) {
      invalidControl.focus();
    }
  }
}
