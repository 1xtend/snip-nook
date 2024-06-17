import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { HomeComponent } from '@features/home/home.component';
import { LogInComponent } from '@features/log-in/log-in.component';
import { ownerGuard } from '@core/guards/owner.guard';
import { snippetOwnerGuard } from '@core/guards/snippet-owner.guard';

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
    path: 'explore',
    loadComponent: () =>
      import('./features/explore/explore.component').then(
        (m) => m.ExploreComponent,
      ),
    title: 'Explore',
    children: [
      {
        path: 'users',
        loadComponent: () =>
          import(
            './features/explore/explore-users/explore-users.component'
          ).then((m) => m.ExploreUsersComponent),
      },
    ],
  },
  {
    path: 'snippet/:id/overview',
    loadComponent: () =>
      import('./features/snippet-overview/snippet-overview.component').then(
        (m) => m.SnippetOverviewComponent,
      ),
  },
  {
    path: 'snippet/:id/edit',
    loadComponent: () =>
      import('./features/snippet-action/snippet-action.component').then(
        (m) => m.SnippetActionComponent,
      ),
    canActivate: [authGuard, snippetOwnerGuard],
    data: {
      action: 'edit',
    },
  },
  {
    path: 'snippet/create',
    loadComponent: () =>
      import('./features/snippet-action/snippet-action.component').then(
        (m) => m.SnippetActionComponent,
      ),
    canActivate: [authGuard],
    data: {
      action: 'create',
    },
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then(
        (m) => m.SettingsComponent,
      ),
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: 'account',
        loadComponent: () =>
          import(
            './features/settings/account-settings/account-settings.component'
          ).then((m) => m.AccountSettingsComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import(
            './features/settings/profile-settings/profile-settings.component'
          ).then((m) => m.ProfileSettingsComponent),
      },
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full',
      },
    ],
  },
];
