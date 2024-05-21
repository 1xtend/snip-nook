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

  loading = signal<boolean>(false);

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

    this.loading.set(true);
    this.form.disable();

    this.authService
      .deleteUser(this.form.getRawValue().password)
      .pipe(take(1))
      .subscribe({
        next: () => this.handleDeleteNext(),
        error: (err) => this.handleDeleteError(err),
      });
  }

  private handleDeleteNext(): void {
    this.loading.set(false);
    this.form.reset();
    this.form.enable();
    this.modalService.closeDialog();
    this.router.navigate(['/home']);

    this.messageService.add({
      severity: 'success',
      detail: 'Account has been successfully deleted',
      summary: 'Success',
    });
  }

  private handleDeleteError(error: Error): void {
    this.loading.set(false);
    this.form.enable();
  }
}
