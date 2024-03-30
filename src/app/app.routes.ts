import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LogInComponent } from './log-in/log-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';

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
