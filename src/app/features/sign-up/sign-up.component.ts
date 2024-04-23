import { SignUpService } from '../../core/services/auth/sign-up.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { IAuthErrors, ISignUpForm } from '@shared/models/auth.interface';
import { FormFocusDirective } from '@shared/directives/form-focus.directive';
import { emailRegex } from '@shared/helpers/regex';
import { AuthService } from '@core/services/auth/auth.service';
import { usernameValidator } from '@shared/helpers/username.validator';
import { take } from 'rxjs';

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
  form!: FormGroup<ISignUpForm>;

  authErrors: Partial<IAuthErrors> | null = null;
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
    private router: Router,
    private signUpService: SignUpService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group<ISignUpForm>({
      username: this.fb.control('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(16),
        ],
        asyncValidators: [usernameValidator(this.authService)],
        updateOn: 'blur',
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
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    this.form.disable();
    this.loading = true;
    this.authErrors = null;

    this.signUpService
      .signUp(this.form.getRawValue())
      .pipe(take(1))
      .subscribe({
        next: (user) => {
          this.form.reset();

          this.router.navigate(['/home']);
        },
        error: (err: Error) => {
          this.authErrors = {
            emailInUse: err.message.includes('auth/email-already-in-use'),
            invalidEmail: err.message.includes('auth/invalid-email'),
            missingEmail: err.message.includes('auth/missing-email'),
          };

          this.form.enable();
          this.loading = false;
          this.cdr.markForCheck();
        },
        complete: () => {
          this.loading = false;
          this.form.enable();
        },
      });
  }
}
