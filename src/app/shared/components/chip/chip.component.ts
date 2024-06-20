import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-chip',
  standalone: true,
  imports: [ButtonModule, ButtonGroupModule],
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipComponent {
  label = input<string>('');
  icon = input<string>('');
  severity = input<string>('');
  size = input<string>('');

  click = output<void>();
  iconClick = output<void>();
}
