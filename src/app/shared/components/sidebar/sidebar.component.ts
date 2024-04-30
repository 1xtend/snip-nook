import {
  ChangeDetectionStrategy,
  Component,
  inject,
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
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, SidebarModule, LogoComponent, InputSwitchModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  visible = model<boolean>(false);
  closeSidebar = output<void>();

  user = this.authService.user;

  signOut(): void {
    this.authService
      .signOut()
      .pipe(take(1))
      .subscribe(() => {
        this.router.navigate(['/home']);
      });
  }
}
