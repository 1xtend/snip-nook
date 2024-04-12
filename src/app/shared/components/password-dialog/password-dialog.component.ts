import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { ModalService } from '@core/services/modal.service';
import { FormFocusDirective } from '@shared/directives/form-focus.directive';
import { AuthErrors, AuthPasswordsForm } from '@shared/models/auth.interface';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { take } from 'rxjs';

@Component({
  selector: 'app-password-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PasswordModule,
    ButtonModule,
    FormFocusDirective,
  ],
  templateUrl: './password-dialog.component.html',
  styleUrl: './password-dialog.component.scss',
})
export class PasswordDialogComponent {
  form!: FormGroup<AuthPasswordsForm>;

  authErrors: Partial<AuthErrors> | null = null;
  loading: boolean = false;

  get passwordControl(): FormControl {
    return this.form.controls['password'];
  }

  get newPasswordControl(): FormControl {
    return this.form.controls['newPassword'];
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private modalService: ModalService,
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group<AuthPasswordsForm>({
      newPassword: this.fb.control('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(16),
        ],
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

    this.form.disable();
    this.loading = true;

    this.authService
      .updatePassword(this.form.getRawValue())
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.form.reset();
          this.modalService.closeDialog();
        },
        error: (err) => {
          this.authErrors = {
            wrongPassword: err.message.includes('auth/wrong-password'),
          };

          this.loading = false;
          this.form.enable();
        },
        complete: () => {
          this.loading = false;
          this.form.enable();
        },
      });
  }
}
