import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-avatar-button',
  standalone: true,
  imports: [AvatarModule],
  templateUrl: './avatar-button.component.html',
  styleUrl: './avatar-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarButtonComponent {
  click = output<void>();
  url = input<string | null>(null);
}
