import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Universe } from './pages/universe/universe';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    pathMatch: 'full'
  },
  {
    path: 'universo',
    component: Universe
  },
  {
    path: '**',
    redirectTo: ''
  }
];