import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-user-saved',
  standalone: true,
  imports: [],
  templateUrl: './user-saved.component.html',
  styleUrl: './user-saved.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSavedComponent {}
