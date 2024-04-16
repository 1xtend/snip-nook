import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { HomeComponent } from '@features/home/home.component';
import { LogInComponent } from '@features/log-in/log-in.component';
import { SignUpComponent } from './features/sign-up/sign-up.component';
import { ownerGuard } from '@core/guards/owner.guard';

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
    children: [
      {
        path: 'overview',
        loadComponent: () =>
          import('./features/user/user-overview/user-overview.component').then(
            (m) => m.UserOverviewComponent,
          ),
      },
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'snippets',
        loadComponent: () =>
          import('./features/user/user-snippets/user-snippets.component').then(
            (m) => m.UserSnippetsComponent,
          ),
      },
      {
        path: 'saved',
        loadComponent: () =>
          import('./features/user/user-saved/user-saved.component').then(
            (m) => m.UserSavedComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/user/user-settings/user-settings.component').then(
            (m) => m.UserSettingsComponent,
          ),
        canActivate: [authGuard, ownerGuard],
      },
    ],
  },
  {
    path: 'trending',
    loadComponent: () =>
      import('./features/trending/trending.component').then(
        (m) => m.TrendingComponent,
      ),
    title: 'Trending',
  },
  {
    path: 'snippet/:id',
    loadComponent: () =>
      import('./features/snippet/snippet.component').then(
        (m) => m.SnippetComponent,
      ),
  },
];
