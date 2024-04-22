import { FormControl, FormGroup } from '@angular/forms';

export interface IAuthForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

export interface IAuthData {
  email: string;
  password: string;
}

export interface IAuthPasswordsForm {
  password: FormControl<string>;
  newPassword: FormControl<string>;
}

export interface IAuthPasswords {
  password: string;
  newPassword: string;
}

export interface IAuthErrors {
  emailInUse: boolean;
  invalidCredential: boolean;
  invalidEmail: boolean;
  missingEmail: boolean;
  wrongPassword: boolean;
  userNotFound: boolean;
}

export interface ISignUpForm extends IAuthForm {
  username: FormControl<string>;
}

export interface ISignUpData extends IAuthData {
  username: string;
}
