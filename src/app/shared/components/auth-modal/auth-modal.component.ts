import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { LogInComponent } from '../log-in/log-in.component';
import { SignUpComponent } from '../sign-up/sign-up.component';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [DialogModule, LogInComponent, SignUpComponent],
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
