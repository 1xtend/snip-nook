import { ModalService } from './../../../core/services/modal.service';
import { Component, OnInit } from '@angular/core';
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
import { AuthService } from '@core/services/auth.service';
import { take } from 'rxjs';
import { AuthErrors, AuthForm } from '@shared/models/auth.interface';
import { MessageService } from 'primeng/api';

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
})
export class EmailDialogComponent implements OnInit {
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
    private modalService: ModalService,
    private messageService: MessageService,
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

    this.form.disable();
    this.loading = true;

    this.authService
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
          console.log(err);
          this.authErrors = {
            wrongPassword: err.message.includes('auth/wrong-password'),
            emailInUse: err.message.includes('auth/email-already-in-use'),
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
