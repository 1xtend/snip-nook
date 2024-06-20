import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { ModalService } from '@core/services/modal.service';
import { UserService } from '@core/services/user.service';
import { IDescriptionForm } from '@shared/models/form.types';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { filter, switchMap, take, throwError } from 'rxjs';

@Component({
  selector: 'app-description-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextareaModule, ButtonModule],
  templateUrl: './description-dialog.component.html',
  styleUrl: './description-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescriptionDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private modalService = inject(ModalService);

  private user$ = this.authService.user$;

  form: FormGroup<IDescriptionForm> = this.fb.group({
    description: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.maxLength(500), Validators.minLength(5)],
    }),
  });

  loading = signal<boolean>(false);
  pending = signal<boolean>(false);

  ngOnInit(): void {
    this.setDescription();
  }

  private setDescription(): void {
    this.pending.set(true);
    this.form.disable();

    this.user$
      .pipe(
        take(1),
        switchMap((user) => {
          if (!user) {
            return throwError(() => new Error('User is not defined'));
          }

          return this.userService.getUser(user?.uid).pipe(take(1));
        }),
      )
      .subscribe({
        next: (user) => {
          this.form.patchValue({
            description: user?.description || '',
          });
          this.pending.set(false);
          this.form.enable();
        },
        error: () => {
          this.pending.set(false);
          this.form.enable();
        },
      });
  }

  onSubmit(): void {
    if (this.form.invalid || this.form.pending) {
      return;
    }

    this.form.disable();
    this.loading.set(true);

    const description = this.form.getRawValue().description;
    this.updateDescription(description);
  }

  private updateDescription(description: string): void {
    this.userService
      .updateDescription(description)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.form.enable();
          this.loading.set(false);
          this.modalService.closeDialog();
          this.messageService.add({
            severity: 'success',
            detail: 'Description has been changed successfully',
            summary: 'Success',
          });
        },
        error: () => {
          this.form.enable();
          this.loading.set(false);
        },
      });
  }
}
