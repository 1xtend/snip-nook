import { AsyncPipe } from '@angular/common';
import { Component, OnInit, Signal, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { SidebarComponent } from '@shared/components/sidebar/sidebar.component';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { Observable, take } from 'rxjs';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { SnippetCardComponent } from '@shared/components/snippet-card/snippet-card.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    RouterOutlet,
    SidebarComponent,
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

  sidebarVisible: boolean = false;

  get hideSidebar(): boolean {
    return this.hasRoute('login') || this.hasRoute('signup');
  }

  ngOnInit(): void {
    this.authService.checkIfTokenIsSaved();

    this.checkIfTokenIsExpired();
  }

  private checkIfTokenIsExpired(): void {
    const token = this.authService.token;

    if (token && this.authService.isTokenExpired()) {
      this.authService.signOut().subscribe();
      console.log('User token is expired');
    }
  }

  toggleSidebar(value: boolean): void {
    this.sidebarVisible = value;
  }

  hasRoute(route: string): boolean {
    return this.router.url.includes(route);
  }
}
