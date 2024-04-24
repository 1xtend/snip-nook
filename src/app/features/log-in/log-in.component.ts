import { LogInService } from '../../core/services/auth/log-in.service';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
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
import { IAuthErrors, IAuthForm } from '@shared/models/auth.interface';
import { FormFocusDirective } from '@shared/directives/form-focus.directive';
import { emailRegex } from '@shared/helpers/regex';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogInComponent implements OnInit {
  form!: FormGroup<IAuthForm>;

  authErrors = signal<Partial<IAuthErrors> | null>(null);
  loading: boolean = false;

  get emailControl(): FormControl {
    return this.form.controls['email'];
  }

  get passwordControl(): FormControl {
    return this.form.controls['password'];
  }

  constructor(
    private fb: FormBuilder,
    private logInService: LogInService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group<IAuthForm>({
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

    this.authErrors.set(null);
    this.loading = true;
    this.form.disable();

    this.logInService
      .logIn(this.form.getRawValue())
      .pipe(take(1))
      .subscribe({
        next: (user) => {
          this.form.reset();

          this.router.navigate(['/home']);
        },
        error: (err: Error) => {
          this.authErrors.set({
            invalidCredential: err.message.includes('auth/invalid-credential'),
            invalidEmail: err.message.includes('auth/invalid-email'),
            missingEmail: err.message.includes('auth/missing-email'),
            userNotFound: err.message.includes('auth/user-not-found'),
            wrongPassword: err.message.includes('auth/wrong-password'),
          });

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
