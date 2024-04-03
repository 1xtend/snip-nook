import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { SidebarComponent } from '@shared/components/sidebar/sidebar.component';
import { LogoComponent } from '@shared/components/logo/logo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    RouterOutlet,
    AsyncPipe,
    SidebarComponent,
    LogoComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  loading$ = this.authService.loading$;

  sidebarVisible: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.authService.checkIfUserIsAuthenticated();

    this.authService.user$.subscribe((user) => {
      console.log('Logged in: ', user);
    });
  }

  toggleSidebar(value: boolean): void {
    this.sidebarVisible = value;
  }

  hasRoute(route: string): boolean {
    return this.router.url.includes(route);
  }
}
