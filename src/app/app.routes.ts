import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/policy-list/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
];
