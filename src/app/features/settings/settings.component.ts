import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterOutlet, TabMenuModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  tabItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-fw pi-user',
      routerLink: ['profile'],
    },
    {
      label: 'Account',
      icon: 'pi pi-fw pi-cog',
      routerLink: ['account'],
    },
  ];
}
