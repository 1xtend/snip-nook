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
import { IAuthData, IAuthForm } from '@shared/models/auth.interface';
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

    this.form.disable();
    this.loading.set(true);

    this.updateEmail(this.form.getRawValue());
  }

  private updateEmail(data: IAuthData): void {
    this.userService
      .updateEmail(data)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.form.reset();
          this.form.enable();
          this.modalService.closeDialog();

          this.messageService.add({
            severity: 'success',
            detail: 'Email has been changed successfully',
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
