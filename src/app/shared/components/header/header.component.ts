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
import { AvatarButtonComponent } from '../avatar-button/avatar-button.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    ButtonModule,
    AvatarModule,
    LogoComponent,
    SkeletonModule,
    AvatarButtonComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private authService = inject(AuthService);

  openSidebar = output<void>();
  user = this.authService.user;
}
