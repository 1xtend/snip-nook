import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { User } from 'firebase/auth';
import { Observable, combineLatest, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent implements OnInit {
  owner: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.paramsChanges();
  }

  private paramsChanges(): void {
    // combineLatest({
    //   params: this.route.paramMap,
    //   queryParams: this.route.queryParamMap,
    // })
    //   .pipe(
    //     takeUntilDestroyed(this.destroyRef),
    //     map(({ params, queryParams }) => {
    //       this.owner = params.get('id') === this.authService.user?.uid;
    //       console.log('Is owner: ', this.owner);
    //     }),
    //   )
    //   .subscribe();
  }
}
