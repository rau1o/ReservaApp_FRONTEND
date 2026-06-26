import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { LoginRequest, LoginResponse } from '../models';

const TOKEN_KEY  = 'reservaapp_token';
const USER_KEY   = 'reservaapp_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<LoginResponse | null>(this.loadUser());

  isLoggedIn = computed(() => !!this._user());
  currentUser = computed(() => this._user());
  isAdmin     = computed(() => this._user()?.rol === 'Admin');

  constructor(private http: HttpClient, private router: Router) {}

  login(req: LoginRequest) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, req).pipe(
      tap(res => {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res));
        this._user.set(res);
      })
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private loadUser(): LoginResponse | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
