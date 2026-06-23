import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="app-shell">
      <nav class="sidebar">
        <div class="brand">ReservaApp</div>
        <ul>
          <li><a routerLink="/reservas"  routerLinkActive="active">🗓 Reservas</a></li>
          <li><a routerLink="/clientes"  routerLinkActive="active">👥 Clientes</a></li>
          <li *ngIf="auth.isAdmin()">
              <a routerLink="/servicios" routerLinkActive="active">🛠 Servicios</a></li>
        </ul>
        <div class="user-section">
          <span>{{ auth.currentUser()?.nombre }}</span>
          <button (click)="auth.logout()">Salir</button>
        </div>
      </nav>
      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-shell { display: flex; height: 100vh; }
    .sidebar { width: 220px; background: #1B5FA8; color: white; display: flex; flex-direction: column; padding: 24px 0; }
    .brand { font-size: 1.3rem; font-weight: 700; padding: 0 24px 24px; border-bottom: 1px solid rgba(255,255,255,.2); }
    ul { list-style: none; margin: 16px 0; padding: 0; flex: 1; }
    li a { display: block; padding: 12px 24px; color: rgba(255,255,255,.8); text-decoration: none; transition: .2s; }
    li a:hover, li a.active { background: rgba(255,255,255,.15); color: white; }
    .user-section { padding: 16px 24px; border-top: 1px solid rgba(255,255,255,.2); font-size: .85rem; }
    .user-section button { margin-top: 8px; background: rgba(255,255,255,.2); border: none; color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; width: 100%; }
    .content { flex: 1; overflow-y: auto; background: #f5f7fa; padding: 32px; }
  `]
})
export class ShellComponent {
  auth = inject(AuthService);
}
