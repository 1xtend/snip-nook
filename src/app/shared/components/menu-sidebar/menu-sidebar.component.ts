import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { LogoComponent } from '../logo/logo.component';
import { AuthService } from '@core/services/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-menu-sidebar',
  standalone: true,
  imports: [RouterLink, SidebarModule, LogoComponent],
  templateUrl: './menu-sidebar.component.html',
  styleUrl: './menu-sidebar.component.scss',
})
export class MenuSidebarComponent {
  private router = inject(Router);

  visible = model<boolean>(false);
  position = input<'right' | 'left'>('right');
  close = output<void>();

  constructor() {}
}
