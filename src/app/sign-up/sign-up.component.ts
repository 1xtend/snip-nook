import { Component, OnInit } from '@angular/core';

import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthForm } from '../shared/models/auth.interface';
import { FormFocusDirective } from '../shared/directives/form-focus.directive';
import { emailRegex } from '../shared/helpers/regex';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    InputTextModule,
    PasswordModule,
    ButtonModule,
    RouterLink,
    ReactiveFormsModule,
    FormFocusDirective,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent implements OnInit {
  form!: FormGroup<AuthForm>;

  get emailControl(): FormControl {
    return this.form.controls['email'];
  }

  get passwordControl(): FormControl {
    return this.form.controls['password'];
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group<AuthForm>({
      email: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(emailRegex)],
      }),
      password: this.fb.control('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(16),
        ],
      }),
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    console.log(this.form.value);
    this.form.reset();
  }
}
