import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [TabMenuModule],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.scss',
})
export class ExploreComponent {
  tabItems: MenuItem[] = [
    {
      label: 'Trending',
      icon: 'pi pi-fw pi-sparkles',
      routerLink: ['trending'],
    },
    {
      label: 'Users',
      icon: 'pi pi-fw pi-users',
      routerLink: ['users'],
    },
  ];
}
