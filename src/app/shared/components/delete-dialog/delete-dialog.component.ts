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
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ModalService } from '@core/services/modal.service';
import { FormFocusDirective } from '@shared/directives/form-focus.directive';
import { IAuthErrors } from '@shared/models/auth.interface';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { take } from 'rxjs';

@Component({
  selector: 'app-delete-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PasswordModule,
    ButtonModule,
    FormFocusDirective,
  ],
  templateUrl: './delete-dialog.component.html',
  styleUrl: './delete-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  form!: FormGroup<{ password: FormControl }>;

  authErrors = signal<Partial<IAuthErrors> | null>(null);
  loading: boolean = false;

  get passwordControl(): FormControl {
    return this.form.controls['password'];
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group<{ password: FormControl }>({
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

    this.authService
      .deleteUser(this.form.getRawValue().password)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            detail: 'Account has been successfully deleted',
            summary: 'Success',
          });

          this.form.reset();
          this.modalService.closeDialog();
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.log(err);
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
