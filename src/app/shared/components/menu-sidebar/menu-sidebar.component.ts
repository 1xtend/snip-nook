import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { LogoComponent } from '../logo/logo.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ThemeService } from '@core/services/theme.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-menu-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    SidebarModule,
    LogoComponent,
    InputSwitchModule,
    ReactiveFormsModule,
  ],
  templateUrl: './menu-sidebar.component.html',
  styleUrl: './menu-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuSidebarComponent implements OnInit {
  private themeService = inject(ThemeService);
  private destroyRef = inject(DestroyRef);

  visible = model<boolean>(false);
  position = input<'right' | 'left'>('right');
  close = output<void>();

  themeControl = new FormControl<boolean>(
    this.themeService.theme === 'dark' ? true : false,
    { nonNullable: true },
  );

  ngOnInit(): void {
    this.themeChanges();
  }

  private themeChanges(): void {
    this.themeControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((checked) => {
        this.themeService.switchTheme(checked ? 'dark' : 'light');
      });
  }
}
