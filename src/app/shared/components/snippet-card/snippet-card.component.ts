import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ISnippetPreview } from '@shared/models/snippet.interface';

@Component({
  selector: 'app-snippet-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './snippet-card.component.html',
  styleUrl: './snippet-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnippetCardComponent {
  @Input({ required: true }) snippet!: ISnippetPreview;
  @Input() readonly: boolean = false;

  constructor() {}
}
