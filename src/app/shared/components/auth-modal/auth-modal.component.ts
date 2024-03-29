import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [DialogModule],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthModalComponent {
  @Input({ required: true }) visible: boolean = false;
}
