import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/identity/login`;

  private token = signal<string | null>(this.getStoredToken()); // Signal for token
  private role = signal<string | null>(this.getStoredRole());   // Signal for role

  // Computed signal for authentication status
  isAuthenticated = computed(() => !!this.token());

  // Computed signal for user role
  userRole = computed(() => this.role());

  constructor(private http: HttpClient, private router: Router) {
    // Effect to watch token changes and store it in localStorage/sessionStorage
    effect(() => {
      if (this.token()) {
        localStorage.setItem('token', this.token()!);
      } else {
        localStorage.removeItem('token');
      }
    });

    effect(() => {
      if (this.role()) {
        localStorage.setItem('role', this.role()!);
      } else {
        localStorage.removeItem('role');
      }
    });
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, data).pipe(
      map(response => {
        this.token.set(response.token); // Set token in signal
        this.role.set(response.role);   // Set role in signal
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred';
        if (error.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (error.status === 403) {
          errorMessage = 'You are not authorized to access this resource';
        } else if (error.status === 0) {
          errorMessage = 'Could not connect to the server';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout() {
    this.token.set(null);
    this.role.set(null);

    this.router.navigate(['/login']);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  private getStoredRole(): string | null {
    return localStorage.getItem('role') || sessionStorage.getItem('role');
  }
}
