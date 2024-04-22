import { UserDeleteService } from '../../../core/services/auth/user-delete.service';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import { LogoComponent } from '../logo/logo.component';
import { AuthService } from '@core/services/auth/auth.service';
import { Observable, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, SidebarModule, LogoComponent, AsyncPipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  @Input() visible: boolean = false;
  @Output() closeSidebar = new EventEmitter<void>();

  get user$(): Observable<User | undefined> {
    return this.authService.user$;
  }

  constructor(
    private authService: AuthService,
    private userDeleteService: UserDeleteService,
    private router: Router,
  ) {}

  signOut(): void {
    this.userDeleteService
      .signOut()
      .pipe(take(1))
      .subscribe(() => {
        this.router.navigate(['/home']);
      });
  }
}
