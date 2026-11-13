
import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Universe } from './pages/universe/universe';
import { Missions } from './pages/missions/missions';
import { Habits } from './pages/habits/habits';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    pathMatch: 'full'
  },
  {
    path: 'misiones',
    component: Missions
  },
  {
    path: 'habitos',
    component: Habits
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
