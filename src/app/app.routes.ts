import { Routes } from '@angular/router';
import { HomeComponent } from '@features/home/home.component';
import { LogInComponent } from '@features/log-in/log-in.component';
import { SignUpComponent } from '@features/sign-up/sign-up.component';

export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    // loadComponent: () =>
    //   import('./log-in/log-in.component').then((m) => m.LogInComponent),
    component: LogInComponent,
  },
  {
    path: 'signup',
    // loadComponent: () =>
    //   import('./sign-up/sign-up.component').then((m) => m.SignUpComponent),
    component: SignUpComponent,
  },
];
