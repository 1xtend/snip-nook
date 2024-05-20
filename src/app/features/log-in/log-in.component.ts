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
import { IAuthForm } from '@shared/models/auth.interface';
import { FormFocusDirective } from '@shared/directives/form-focus.directive';
import { emailRegex } from '@shared/helpers/regex';
import { take } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { User } from 'firebase/auth';
import { MessageService } from 'primeng/api';

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
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  form!: FormGroup<IAuthForm>;

  loading = signal<boolean>(false);

  get emailControl(): FormControl {
    return this.form.controls['email'];
  }

  get passwordControl(): FormControl {
    return this.form.controls['password'];
  }

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

    this.loading.set(true);
    this.form.disable();

    this.authService
      .logIn(this.form.getRawValue())
      .pipe(take(1))
      .subscribe({
        next: (user) => this.handleLoginNext(user),
        error: (err: Error) => this.handleLoginError(err),
      });
  }

  private handleLoginNext(user: User): void {
    this.loading.set(false);
    this.form.reset();
    this.form.enable();
    this.router.navigate(['/user', user.uid, 'overview']);
  }

  private handleLoginError(error: Error): void {
    this.messageService.add({
      severity: 'error',
      detail: error.message,
      summary: 'Auth Error',
      life: 4000,
    });
    this.form.enable();
    this.loading.set(false);
  }
}
