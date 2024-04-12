import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { SidebarComponent } from '@shared/components/sidebar/sidebar.component';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { Observable } from 'rxjs';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    RouterOutlet,
    AsyncPipe,
    SidebarComponent,
    LogoComponent,
    LoaderComponent,
    ProgressSpinnerModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  sidebarVisible: boolean = false;

  get authLoading$(): Observable<boolean> {
    return this.authService.loading$;
  }

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.authService.checkIfUserIsAuthenticated();
  }

  toggleSidebar(value: boolean): void {
    this.sidebarVisible = value;
  }

  hasRoute(route: string): boolean {
    return this.router.url.includes(route);
  }
}
