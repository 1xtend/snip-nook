import { FormControl, FormGroup } from '@angular/forms';

export interface AuthForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

export interface AuthData {
  email: string;
  password: string;
}

export interface AuthPasswordsForm {
  password: FormControl<string>;
  newPassword: FormControl<string>;
}

export interface AuthPasswords {
  password: string;
  newPassword: string;
}

export interface AuthErrors {
  emailInUse: boolean;
  invalidCredential: boolean;
  invalidEmail: boolean;
  missingEmail: boolean;
  wrongPassword: boolean;
  userNotFound: boolean;
}

export interface SignUpForm extends AuthForm {
  username: FormControl<string>;
}

export interface SignUpData extends AuthData {
  username: string;
}
