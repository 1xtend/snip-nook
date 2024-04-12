import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-password-dialog',
  standalone: true,
  imports: [],
  templateUrl: './password-dialog.component.html',
  styleUrl: './password-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordDialogComponent {}