import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { AsyncPipe } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { SharedService } from '@core/services/shared.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, ButtonModule, AvatarModule, AsyncPipe, MenuModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  items: MenuItem[] = this.sharedService.menuItems;

  isLoggedIn$ = this.authService.isLoggedIn$;

  constructor(
    private authService: AuthService,
    private sharedService: SharedService,
  ) {}
}
