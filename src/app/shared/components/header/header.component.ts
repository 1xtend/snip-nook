import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
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
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

  get user$(): Observable<User | undefined> {
    return this.authService.user$;
  }

  constructor(
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.user$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.cdr.detectChanges();
      console.log('Detect changes');
    });
  }
}
