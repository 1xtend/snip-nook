import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ISocial } from './user.interface';

export interface IDescriptionForm {
  description: FormControl<string>;
}

export interface ISocialFormGroup {
  name: FormControl<string>;
  icon: FormControl<string>;
  link: FormControl<string>;
}

export interface IProfileForm {
  description: FormControl<string>;
  socials: FormArray<FormGroup<ISocialFormGroup>>;
  birthday: FormControl<string | null>;
}
