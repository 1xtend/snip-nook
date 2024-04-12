import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-user-overview',
  standalone: true,
  imports: [],
  templateUrl: './user-overview.component.html',
  styleUrl: './user-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserOverviewComponent {}
