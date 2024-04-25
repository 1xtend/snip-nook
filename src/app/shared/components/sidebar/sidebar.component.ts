import { UserService } from './../../../core/services/user.service';
import {
  ChangeDetectionStrategy,
  Component,
  model,
  output,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { LogoComponent } from '../logo/logo.component';
import { AuthService } from '@core/services/auth/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, SidebarModule, LogoComponent, InputSwitchModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  visible = model<boolean>(false);
  closeSidebar = output<void>();

  user = this.authService.user.asReadonly();

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
  ) {}

  signOut(): void {
    this.userService
      .signOut()
      .pipe(take(1))
      .subscribe(() => {
        this.router.navigate(['/home']);
      });
  }
}
