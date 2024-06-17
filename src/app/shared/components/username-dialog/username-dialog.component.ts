import { UserService } from '@core/services/user.service';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-username-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './username-dialog.component.html',
  styleUrl: './username-dialog.component.scss',
})
export class UsernameDialogComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  private user$ = this.authService.user$;

  form: FormGroup = this.fb.group({
    username: this.fb.control<string>('', {
      nonNullable: true,
    }),
  });

  ngOnInit(): void {
    this.setUsername();
  }

  private setUsername(): void {
    this.user$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      this.form.patchValue({
        username: user?.displayName || '',
      });
    });
  }
}
