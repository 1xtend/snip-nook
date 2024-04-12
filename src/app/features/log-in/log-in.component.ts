import { Component, OnInit } from '@angular/core';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthErrors, AuthForm } from '@shared/models/auth.interface';
import { FormFocusDirective } from '@shared/directives/form-focus.directive';
import { emailRegex } from '@shared/helpers/regex';
import { AuthService } from '@core/services/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [
    InputTextModule,
    PasswordModule,
    ButtonModule,
    RouterLink,
    ReactiveFormsModule,
    FormFocusDirective,
  ],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss',
})
export class LogInComponent implements OnInit {
  form!: FormGroup<AuthForm>;

  authErrors: Partial<AuthErrors> | null = null;
  loading: boolean = false;

  get emailControl(): FormControl {
    return this.form.controls['email'];
  }

  get passwordControl(): FormControl {
    return this.form.controls['password'];
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

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
        validators: [Validators.required],
      }),
    });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authErrors = null;
    this.loading = true;
    this.form.disable();

    this.authService
      .logIn(this.form.getRawValue())
      .pipe(take(1))
      .subscribe({
        next: (user) => {
          this.form.reset();

          this.router.navigate(['/home']);
        },
        error: (err: Error) => {
          this.authErrors = {
            invalidCredential: err.message.includes('auth/invalid-credential'),
            invalidEmail: err.message.includes('auth/invalid-email'),
            missingEmail: err.message.includes('auth/missing-email'),
            userNotFound: err.message.includes('auth/user-not-found'),
            wrongPassword: err.message.includes('auth/wrong-password'),
          };

          console.log(err);

          this.form.enable();
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
          this.form.enable();
        },
      });
  }
}
