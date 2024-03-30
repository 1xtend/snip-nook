import { FormControl } from '@angular/forms';

export interface AuthForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

export interface AuthData {
  email: string;
  password: string;
}
