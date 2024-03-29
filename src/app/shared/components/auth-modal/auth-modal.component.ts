import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
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
  @Input() logIn: boolean = true;

  @Output() closeModal = new EventEmitter<void>();

  constructor() {}

  onVisibleChange(value: boolean): void {
    if (!value) {
      this.closeModal.emit();
    }
  }
}
