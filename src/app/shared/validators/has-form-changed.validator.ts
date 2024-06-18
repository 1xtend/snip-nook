import {
  AbstractControl,
  FormArray,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export function hasFormChangedValidator(initialValue: any): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    if (group instanceof FormGroup) {
      const value = group.getRawValue();

      const valid = Object.keys(value).some((key) => {
        const x = initialValue[key];
        const y = value[key];

        if (typeof x === 'object' && typeof y === 'object') {
          return compareObjects(x, y);
        }

        if (Array.isArray(x) && Array.isArray(y)) {
          return compareArrays(x, y);
        }

        return isEqual(x, y);
      });

      console.log('is valid', valid);

      return valid ? null : { unchanged: true };
    } else {
      throw new Error('Parameter "group" must be an instance of FormGroup');
    }
  };
}

function compareObjects(x: any, y: any): boolean {
  const arrayX = Object.entries(x).sort();
  const arrayY = Object.entries(y).sort();
  return isEqual(arrayX, arrayY);
}

function compareArrays(x: any[], y: any[]): boolean {
  const arrayX = filterArray(x);
  const arrayY = filterArray(y);
  return isEqual(arrayX, arrayY);
}

function filterArray(array: any[]): any[] {
  return array
    .map((item) => {
      if (typeof item === 'object') {
        return Object.entries(item).sort();
      }

      if (Array.isArray(item)) {
        return item.sort();
      }

      return item;
    })
    .sort();
}

function isEqual(x: any, y: any): boolean {
  return JSON.stringify(x) !== JSON.stringify(y);
}
