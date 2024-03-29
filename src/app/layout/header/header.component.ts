import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, ButtonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {}
