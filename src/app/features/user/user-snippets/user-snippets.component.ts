import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-user-snippets',
  standalone: true,
  imports: [],
  templateUrl: './user-snippets.component.html',
  styleUrl: './user-snippets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSnippetsComponent {}
