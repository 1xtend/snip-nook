import {
  ChangeDetectionStrategy,
  Component,
  output,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { SkeletonModule } from 'primeng/skeleton';
import { LogoComponent } from '../logo/logo.component';
import { AvatarComponent } from '../avatar/avatar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    ButtonModule,
    AvatarModule,
    LogoComponent,
    SkeletonModule,
    AvatarComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private authService = inject(AuthService);

  openSidebar = output<void>();
  user = this.authService.user;
  isAuthenticated = this.authService.isAuthenticated;
}
