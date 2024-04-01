import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    console.log(this.authService.isLoggedIn);

    this.authService.checkIfUserIsAuthenticated();

    this.authService.isLoggedIn$.subscribe((value) => {
      console.log('Logged in: ', value);
    });
  }

  hasRoute(route: string): boolean {
    return this.router.url.includes(route);
  }
}
