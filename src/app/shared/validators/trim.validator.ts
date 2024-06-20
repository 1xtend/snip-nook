import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function trimValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value;

    if (!value || value === '') {
      return null;
    }

    if (value.startsWith(' ') || value.endsWith(' ')) {
      control.setValue(value.trim(), { emitEvent: false, onlySelf: true });
    }

    return null;
  };
}
