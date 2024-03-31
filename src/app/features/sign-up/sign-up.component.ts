import { Component, DestroyRef, OnInit } from '@angular/core';
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
import { AuthErrors, SignUpForm } from '@shared/models/auth.interface';
import { FormFocusDirective } from '@shared/directives/form-focus.directive';
import { emailRegex } from '@shared/helpers/regex';
import { AuthService } from '@core/services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  form!: FormGroup<SignUpForm>;

  authErrors: Partial<AuthErrors> | null = null;
  loading: boolean = false;

  get emailControl(): FormControl {
    return this.form.controls['email'];
  }
  get passwordControl(): FormControl {
    return this.form.controls['password'];
  }
  get usernameControl(): FormControl {
    return this.form.controls['username'];
  }
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group<SignUpForm>({
      username: this.fb.control('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(16),
        ],
      }),
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

    this.form.disable();
    this.loading = true;
    this.authErrors = null;

    this.authService
      .signUp(this.form.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.form.reset();
          this.form.enable();
          this.loading = false;

          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.authErrors = {
            emailInUse: err.code === 'auth/email-already-in-use',
          };

          this.form.enable();
          this.loading = false;
        },
      });
  }
}
