import { ModalService } from './../../../core/services/modal.service';
import { MessageService } from 'primeng/api';
import { UserService } from '@core/services/user.service';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { usernameValidator } from '@shared/validators/username.validator';
import { FormFocusDirective } from '@shared/directives/form-focus.directive';
import { hasFormChangedValidator } from '@shared/validators/has-form-changed.validator';
import { take } from 'rxjs';

interface IUsernameForm {
  username: FormControl<string>;
}

@Component({
  selector: 'app-username-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    FormFocusDirective,
  ],
  templateUrl: './username-dialog.component.html',
  styleUrl: './username-dialog.component.scss',
})
export class UsernameDialogComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private messageService = inject(MessageService);
  private modalService = inject(ModalService);

  private user$ = this.authService.user$;

  loading = signal<boolean>(false);
  pending = signal<boolean>(false);

  form: FormGroup<IUsernameForm> = this.fb.group({
    username: this.fb.control<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(16),
      ],
      asyncValidators: [usernameValidator(this.authService)],
    }),
  });

  get usernameControl(): FormControl {
    return this.form.controls['username'] as FormControl;
  }

  ngOnInit(): void {
    this.setUsername();
  }

  private setUsername(): void {
    this.form.disable();
    this.pending.set(true);

    this.user$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      this.form.patchValue({
        username: user?.displayName || '',
      });
      this.form.enable();
      this.pending.set(false);
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.form.pending) {
      this.form.markAllAsTouched();
      return;
    }

    const username = this.form.getRawValue().username;
    this.form.disable();
    this.loading.set(true);

    console.log(this.form.getRawValue());

    this.updateUsername(username);
  }

  private updateUsername(name: string): void {
    this.userService
      .updateUsername(name)
      .pipe(take(1))
      .subscribe({
        next: (name) => {
          this.form.enable();
          this.loading.set(false);
          this.modalService.closeDialog();
          this.messageService.add({
            severity: 'success',
            detail: 'Username has been changed successfully',
            summary: 'Success',
          });
        },
        error: (err) => {
          this.loading.set(false);
          this.form.enable();
        },
      });
  }
}
