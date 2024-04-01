import { Routes } from '@angular/router';
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
    component: SignUpComponent,
    title: 'Sign Up',
  },
];
