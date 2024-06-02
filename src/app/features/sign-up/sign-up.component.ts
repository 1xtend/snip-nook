import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
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
import { ISignUpData, ISignUpForm } from '@shared/models/auth.interface';
import { FormFocusDirective } from '@shared/directives/form-focus.directive';
import { emailRegex } from '@shared/helpers/regex';
import { AuthService } from '@core/services/auth.service';
import { usernameValidator } from '@shared/validators/username.validator';
import { take } from 'rxjs';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

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
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form!: FormGroup<ISignUpForm>;

  loading = signal<boolean>(false);

  get emailControl(): FormControl {
    return this.form.controls['email'];
  }
  get passwordControl(): FormControl {
    return this.form.controls['password'];
  }
  get usernameControl(): FormControl {
    return this.form.controls['username'];
  }

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
      }),
      email: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(emailRegex)],
        updateOn: 'blur',
      }),
      password: this.fb.control('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(16),
        ],
        updateOn: 'blur',
      }),
    });
  }

  onSubmit(): void {
    if (!this.form.valid || this.form.pending) {
      this.form.markAllAsTouched();
      return;
    }

    this.form.disable();
    this.loading.set(true);

    this.signUp(this.form.getRawValue());
  }

  private signUp(data: ISignUpData): void {
    this.authService
      .signUp(data)
      .pipe(take(1))
      .subscribe({
        next: (user) => {
          this.loading.set(false);
          this.form.reset();
          this.form.enable();
          this.router.navigate(['/user', user.uid, 'overview']);
        },
        error: () => {
          this.form.enable();
          this.loading.set(false);
        },
      });
  }
}
