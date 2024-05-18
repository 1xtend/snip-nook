import { ThemeService } from './core/services/theme.service';
import { ModalService } from './core/services/modal.service';
import {
  Component,
  OnInit,
  computed,
  inject,
  model,
  signal,
} from '@angular/core';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { UserSidebarComponent } from '@shared/components/user-sidebar/user-sidebar.component';
import { MenuSidebarComponent } from '@shared/components/menu-sidebar/menu-sidebar.component';
import { filter, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    RouterOutlet,
    UserSidebarComponent,
    MenuSidebarComponent,
    LoaderComponent,
    ProgressSpinnerModule,
    ToastModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private themeService = inject(ThemeService);

  menuSidebarVisible = model<boolean>(false);
  userSidebarVisible = model<boolean>(false);

  get hideSidebar(): boolean {
    return this.hasRoute('login') || this.hasRoute('signup');
  }

  ngOnInit(): void {
    this.authService.userChanges();

    this.checkTokenExpiration();
    this.checkTheme();
  }

  private checkTheme(): void {
    this.themeService.checkSavedTheme();
  }

  private checkTokenExpiration(): void {
    const token = this.authService.token;

    if (token && this.authService.isTokenExpired()) {
      this.authService.signOut().subscribe();
    }
  }

  openSidebar(type: 'user' | 'menu'): void {
    if (type === 'menu') {
      this.menuSidebarVisible.set(true);
    } else {
      this.userSidebarVisible.set(true);
    }
  }

  closeSidebar(): void {
    this.userSidebarVisible.set(false);
    this.menuSidebarVisible.set(false);
  }

  hasRoute(route: string): boolean {
    return this.router.url.includes(route);
  }
}
