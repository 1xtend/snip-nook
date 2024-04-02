import { Injectable } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  menuItems: MenuItem[] = [
    {
      label: 'View profile',
      icon: 'pi pi-user',
      routerLink: ['/user', this.authService.user?.uid],
    },
    {
      label: 'Log out',
      icon: 'pi pi-sign-out',
      command: () => {
        this.authService.logOut();
      },
    },
  ];

  constructor(private authService: AuthService) {}
}
