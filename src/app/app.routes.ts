import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login',     loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      { path: '',          redirectTo: 'reservas', pathMatch: 'full' },
      { path: 'reservas',  loadComponent: () => import('./features/reservas/reservas-list/reservas-list.component').then(m => m.ReservasListComponent) },
      { path: 'clientes',  loadComponent: () => import('./features/clientes/clientes-list/clientes-list.component').then(m => m.ClientesListComponent) },
      { path: 'servicios', canActivate: [adminGuard], loadComponent: () => import('./features/servicios/servicios-list/servicios-list.component').then(m => m.ServiciosListComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];
