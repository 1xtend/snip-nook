import { ThemeService } from './core/services/theme.service';
import { Component, OnInit, inject, model } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { ToastModule } from 'primeng/toast';
import { UserSidebarComponent } from '@shared/components/user-sidebar/user-sidebar.component';
import { MenuSidebarComponent } from '@shared/components/menu-sidebar/menu-sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    RouterOutlet,
    UserSidebarComponent,
    MenuSidebarComponent,
    LoaderComponent,
    ToastModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);

  menuSidebarVisible = model<boolean>(false);
  userSidebarVisible = model<boolean>(false);

  get hideSidebar(): boolean {
    return this.hasRoute('login') || this.hasRoute('signup');
  }

  ngOnInit(): void {
    this.checkTokenExpiration();
    this.checkTheme();

    this.authService.user$.subscribe((user) => {
      console.log('User: ', user);
    });
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
