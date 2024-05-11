import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { LogoComponent } from '../logo/logo.component';
import { AuthService } from '@core/services/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-user-sidebar',
  standalone: true,
  imports: [RouterLink, SidebarModule, LogoComponent, InputSwitchModule],
  templateUrl: './user-sidebar.component.html',
  styleUrl: './user-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  visible = model<boolean>(false);
  position = input<'right' | 'left'>('right');
  close = output<void>();

  user = this.authService.user;

  constructor() {}

  signOut(): void {
    this.authService
      .signOut()
      .pipe(take(1))
      .subscribe(() => {
        this.router.navigate(['/home']);
      });
  }
}
