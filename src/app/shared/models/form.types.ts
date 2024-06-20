import { FormArray, FormControl } from '@angular/forms';
import { ISocial } from './user.interface';

export interface IDescriptionForm {
  description: FormControl<string>;
}

export interface IProfileForm {
  description: FormControl<string>;
  socials: FormArray<FormControl<ISocial>>;
  birthday: FormControl<string>;
}
