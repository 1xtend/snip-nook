import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-menu-sidebar',
  standalone: true,
  imports: [RouterLink, SidebarModule, LogoComponent],
  templateUrl: './menu-sidebar.component.html',
  styleUrl: './menu-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuSidebarComponent {
  visible = model<boolean>(false);
  position = input<'right' | 'left'>('right');
  close = output<void>();

  constructor() {}
}
