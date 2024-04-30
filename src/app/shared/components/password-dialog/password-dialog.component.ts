import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ModalService } from '@core/services/modal.service';
import { UserService } from '@core/services/user.service';
import { FormFocusDirective } from '@shared/directives/form-focus.directive';
import { IAuthErrors, IAuthPasswordsForm } from '@shared/models/auth.interface';
import { MessageService } from 'primeng/api';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private modalService = inject(ModalService);
  private messageService = inject(MessageService);

  form!: FormGroup<IAuthPasswordsForm>;

  authErrors = signal<Partial<IAuthErrors> | null>(null);
  loading: boolean = false;

  get passwordControl(): FormControl {
    return this.form.controls['password'];
  }

  get newPasswordControl(): FormControl {
    return this.form.controls['newPassword'];
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group<IAuthPasswordsForm>({
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

    this.authErrors.set(null);
    this.form.disable();
    this.loading = true;

    this.userService
      .updatePassword(this.form.getRawValue())
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.form.reset();
          this.modalService.closeDialog();

          this.messageService.add({
            severity: 'success',
            detail: 'Password has been changed successfully',
            summary: 'Success',
          });
        },
        error: (err) => {
          this.authErrors.set({
            wrongPassword: err.message.includes('auth/wrong-password'),
          });

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
