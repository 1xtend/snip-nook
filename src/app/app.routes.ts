import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { HomeComponent } from '@features/home/home.component';
import { LogInComponent } from '@features/log-in/log-in.component';
import { SignUpComponent } from '@features/sign-up/sign-up.component';

export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    title: 'Home',
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LogInComponent,
    title: 'Log In',
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/sign-up/sign-up.component').then(
        (m) => m.SignUpComponent,
      ),
    title: 'Sign Up',
  },
  {
    path: 'user/:id',
    loadComponent: () =>
      import('./features/user/user.component').then((m) => m.UserComponent),
  },
  {
    path: 'trending',
    loadComponent: () =>
      import('./features/trending/trending.component').then(
        (m) => m.TrendingComponent,
      ),
    title: 'Trending',
  },
];
