import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_URL = '/api/users'; // Gateway URL
  
  // Signals for state management
  private currentUserSignal = signal<AuthResponse | null>(this.getStoredAuth());
  
  // Computed values
  currentUser = computed(() => this.currentUserSignal());
  isAuthenticated = computed(() => !!this.currentUserSignal());
  
  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.AUTH_URL}/login`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.AUTH_URL}/register`, userData);
  }

  forgotPassword(email: string): Observable<string> {
    return this.http.post(`${this.AUTH_URL}/forgot-password`, { email }, { responseType: 'text' });
  }

  resetPassword(data: any): Observable<string> {
    return this.http.post(`${this.AUTH_URL}/reset-password`, data, { responseType: 'text' });
  }

  logout(): void {
    localStorage.removeItem('recharge_nova_auth');
    this.currentUserSignal.set(null);
  }

  updateUser(data: Partial<AuthResponse>): void {
    const current = this.currentUserSignal();
    if (current) {
      const updated = { ...current, ...data };
      this.handleAuthSuccess(updated);
    }
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem('recharge_nova_auth', JSON.stringify(response));
    this.currentUserSignal.set(response);
  }

  private getStoredAuth(): AuthResponse | null {
    const stored = localStorage.getItem('recharge_nova_auth');
    return stored ? JSON.parse(stored) : null;
  }

  getToken(): string | null {
    return this.currentUserSignal()?.token || null;
  }
}
