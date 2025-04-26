import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, RegisterResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private identityApiUrl = `${ environment.apiUrl }/identity`;
  private usersApiUrl = `${ environment.apiUrl }/users`;

  private role = signal<string | null>(null);
  // private accessToken = signal<string | null>(null);
  public isAuthenticated = computed(() => this.role() !== null); // && this.accessToken() !== null);

  constructor(private http: HttpClient, private router: Router) {
    this.restoreSession();
  }

  login(data: LoginRequest): Observable<void> {
    return this.http.post<AuthResponse>(`${ this.identityApiUrl }/login`, data).pipe(
      switchMap((response) => {
        // this.accessToken.set(response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        return this.fetchUserRole();
      }), // 🔥 Ensures role is fetched before proceeding
      catchError(this.handleAuthError)
    );
  }

  register(data: RegisterRequest): Observable<boolean> {
    return this.http.post(`${ this.identityApiUrl }/register`, data, { observe: 'response' }).pipe(
      map(response => response.status === 200),
      catchError(this.handleAuthError)
    );
  }

  fetchUserRole(): Observable<void> {
    return this.http.get<{ role: string }>(`${ this.usersApiUrl }/me`).pipe(
      map(response => {
        this.role.set(response.role);
      }),
      catchError(() => {
        this.role.set(null);
        // this.accessToken.set(null);
        return throwError(() => new Error('Failed to fetch user role'));
      })
    );
  }

  logout(): void {
    this.http.post(`${ this.identityApiUrl }/logout`, {}).subscribe({
      next: () => {
        this.role.set(null);
        // this.accessToken.set(null);
        localStorage.removeItem('refreshToken');
      },
      error: () => console.error('Logout failed')
    });
  }

  restoreSession(): Observable<void> {
    return this.fetchUserRole().pipe(catchError(() => of(undefined)));
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${this.identityApiUrl}/refresh-token`, { refreshToken }).pipe(
      map(response => {
        // this.accessToken.set(response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        return response;
      }),
      catchError((error) => {
        this.logout(); // If refresh fails, likely the refresh token is also invalid
        return throwError(() => error);
      })
    );
  }

  // getAccessToken(): string | null {
  //   return this.accessToken();
  // }

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    if (error.status === 400) errorMessage = 'Invalid request';
    else if (error.status === 401) errorMessage = 'Invalid credentials';
    else if (error.status === 403) errorMessage = 'Not authorized';
    else if (error.status === 409) errorMessage = 'User already exists';
    else if (error.status === 0) errorMessage = 'Cannot connect to server';
    // this.router.navigate(['/login']);
    return throwError(() => new Error(errorMessage));
  }
}
