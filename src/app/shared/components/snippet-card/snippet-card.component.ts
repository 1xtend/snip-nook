import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ISnippetPreview } from '@shared/models/snippet.interface';
import { TruncateTextPipe } from '@shared/pipes/truncate-text.pipe';

@Component({
  selector: 'app-snippet-card',
  standalone: true,
  imports: [RouterLink, TruncateTextPipe],
  templateUrl: './snippet-card.component.html',
  styleUrl: './snippet-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnippetCardComponent {
  snippet = input.required<ISnippetPreview>();
  readonly = input<boolean>(false);
}
