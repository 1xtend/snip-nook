import {
  AbstractControl,
  FormArray,
  FormControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ICodeItem } from '@shared/models/snippet.interface';
import { Observable } from 'rxjs';

export function codeEditorValidator(): ValidatorFn {
  return (array: AbstractControl): ValidationErrors | null => {
    if (array instanceof FormArray) {
      let valid: boolean = true;

      if (!array.length) {
        return { emptyArray: true };
      }

      // array.value.forEach(({ language, code }: ICodeItem) => {
      //   console.log('ITERATE');

      //   if (!language || !code) {
      //     valid = false;
      //   }
      // });

      for (let i = 0; i < array.length; i++) {
        const { language, code } = array.value[i];

        if (!language || !code) {
          valid = false;
          console.log('false branch');
          break;
        }
      }

      console.log('Valid: ', valid);

      return valid ? null : { emptyFields: true };
    } else {
      throw new Error('Variable "array" must be an instance of FormArray');
    }
  };
}
