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

      array.getRawValue().forEach(({ language, code }: ICodeItem) => {
        console.log('ITERATE');

        if (!language || !code) {
          valid = false;
        }
      });

      console.log('Valid: ', valid);

      return valid ? null : { emptyFields: true };

      // let valid: boolean = true;

      // if (!array.controls.length) {
      //   return null;
      // }

      // array.controls.forEach((control) => {
      //   const value = control.value as ICodeItem;

      //   if (!value.code || !value.language) {
      //     valid = false;
      //   }
      // });

      // console.log('VALIDATE: ', valid);

      // return valid ? null : { emptyFields: true };
    } else {
      throw new Error('Variable "array" must be an instance of FormArray');
    }
  };
}
