import {
  AbstractControl,
  FormArray,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export function codeEditorValidator(): ValidatorFn {
  return (array: AbstractControl): ValidationErrors | null => {
    if (array instanceof FormArray) {
      if (!array.length) {
        return { emptyArray: true };
      }

      let valid: boolean = true;

      for (let i = 0; i < array.length; i++) {
        const { language, code } = array.value[i];

        if (!language || !code) {
          valid = false;
          break;
        }
      }

      return valid ? null : { emptyFields: true };
    } else {
      throw new Error('Parameter "array" must be an instance of FormArray');
    }
  };
}
