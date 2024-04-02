import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { AsyncPipe } from '@angular/common';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, ButtonModule, AvatarModule, AsyncPipe, LogoComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  @Output() openSidebar = new EventEmitter<void>();

  isLoggedIn$ = this.authService.isLoggedIn$;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {}

  logOut(): void {
    this.authService.logOut();
  }
}
