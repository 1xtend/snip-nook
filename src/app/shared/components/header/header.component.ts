import {
  ChangeDetectionStrategy,
  Component,
  output,
  inject,
  signal,
  effect,
  computed,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { SkeletonModule } from 'primeng/skeleton';
import { LogoComponent } from '../logo/logo.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { toSignal } from '@angular/core/rxjs-interop';

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

  openSidebar = output<'user' | 'menu'>();

  user = toSignal(this.authService.user$);
  isAuthenticated = toSignal(this.authService.isAuthenticated$);
  loading = computed<boolean>(() => !this.user());

  // user = this.authService.user;
  // loading = computed<boolean>(() => !this.user());
  // isAuthenticated = this.authService.isAuthenticated;
}
