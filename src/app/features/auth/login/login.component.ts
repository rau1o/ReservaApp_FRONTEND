import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="login-wrap">
      <div class="login-card">
        <h1>ReservaApp</h1>
        <p class="subtitle">Sistema de Gestión de Reservas</p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="field">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="admin@reservaapp.com" />
          </div>
          <div class="field">
            <label>Contraseña</label>
            <input type="password" formControlName="password" placeholder="••••••••" />
          </div>
          <div class="error" *ngIf="error()">{{ error() }}</div>
          <button type="submit" [disabled]="loading()">
            {{ loading() ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f0f4f8; }
    .login-card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,.08); width: 360px; }
    h1 { color: #1B5FA8; margin: 0 0 4px; font-size: 1.8rem; }
    .subtitle { color: #888; margin: 0 0 32px; font-size: .9rem; }
    .field { margin-bottom: 20px; }
    label { display: block; font-size: .85rem; font-weight: 600; color: #444; margin-bottom: 6px; }
    input { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box; }
    input:focus { outline: none; border-color: #1B5FA8; }
    button { width: 100%; padding: 12px; background: #1B5FA8; color: white; border: none; border-radius: 6px; font-size: 1rem; cursor: pointer; font-weight: 600; }
    button:hover:not(:disabled) { background: #154d8a; }
    button:disabled { opacity: .6; cursor: not-allowed; }
    .error { background: #fff0f0; color: #c0392b; padding: 10px; border-radius: 6px; margin-bottom: 16px; font-size: .9rem; }
  `]
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  loading = signal(false);
  error   = signal('');

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.error.set('Credenciales incorrectas.');
        this.loading.set(false);
      }
    });
  }
}
