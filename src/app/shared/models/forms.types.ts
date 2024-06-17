import { FormControl } from '@angular/forms';

export interface IProfileSettingsForm {
  username: FormControl<string>;
  description: FormControl<string>;
}
