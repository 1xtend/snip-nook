import { FormControl } from '@angular/forms';

export interface AuthForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

export interface SignUpForm extends AuthForm {
  username: FormControl<string>;
}

export interface AuthData {
  email: string;
  password: string;
}

export interface AuthErrors {
  emailInUse: boolean;
}
