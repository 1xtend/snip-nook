import { ModalService } from './../../../core/services/modal.service';
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
import { emailRegex } from '@shared/helpers/regex';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { FormFocusDirective } from '@shared/directives/form-focus.directive';
import { take } from 'rxjs';
import { IAuthErrors, IAuthForm } from '@shared/models/auth.interface';
import { MessageService } from 'primeng/api';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-email-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    FormFocusDirective,
    PasswordModule,
  ],
  templateUrl: './email-dialog.component.html',
  styleUrl: './email-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private modalService = inject(ModalService);
  private messageService = inject(MessageService);

  form!: FormGroup<IAuthForm>;

  authErrors = signal<Partial<IAuthErrors> | null>(null);
  loading: boolean = false;

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

    this.authErrors.set(null);
    this.form.disable();
    this.loading = true;

    this.userService
      .updateEmail(this.form.getRawValue())
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.form.reset();
          this.modalService.closeDialog();

          this.messageService.add({
            severity: 'success',
            detail: 'Email has been changed successfully',
            summary: 'Success',
          });
        },
        error: (err) => {
          this.authErrors.set({
            wrongPassword: err.message.includes('auth/wrong-password'),
            emailInUse: err.message.includes('auth/email-already-in-use'),
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
