import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-snippet-edit',
  standalone: true,
  imports: [],
  templateUrl: './snippet-edit.component.html',
  styleUrl: './snippet-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnippetEditComponent {}
