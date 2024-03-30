import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { LogInComponent } from '../log-in/log-in.component';
import { SignUpComponent } from '../sign-up/sign-up.component';
import { AuthModalService } from '../../services/auth-modal.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [DialogModule, LogInComponent, SignUpComponent],
  providers: [AuthModalService],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthModalComponent {
  get logIn(): boolean {
    return this.authModalService.getLogIn;
  }

  constructor(private authModalService: AuthModalService) {}
}
