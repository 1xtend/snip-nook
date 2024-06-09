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
import {
  IAuthPasswords,
  IAuthPasswordsForm,
} from '@shared/models/auth.interface';
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

  loading = signal<boolean>(false);

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

    this.form.disable();
    this.loading.set(true);

    this.updatePassword(this.form.getRawValue());
  }

  private updatePassword(data: IAuthPasswords): void {
    this.userService
      .updatePassword(this.form.getRawValue())
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.form.reset();
          this.form.enable();
          this.modalService.closeDialog();
          this.messageService.add({
            severity: 'success',
            detail: 'Password has been changed successfully',
            summary: 'Success',
          });
        },
        error: () => {
          this.loading.set(false);
          this.form.enable();
        },
      });
  }
}
