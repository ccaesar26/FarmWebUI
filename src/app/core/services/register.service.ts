import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { RegisterRequest } from '../models/register.model';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private apiUrl = `${environment.apiUrl}/identity/register`;

  constructor(private http: HttpClient, private router: Router) {}

  register(data: RegisterRequest): Observable<boolean> {
    return this.http.post(this.apiUrl, data, { observe: 'response' }).pipe(
      map(response => response.status === 200),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred';
        if (error.status === 400) {
          errorMessage = 'Invalid registration data';
        } else if (error.status === 409) {
          errorMessage = 'User already exists';
        } else if (error.status === 0) {
          errorMessage = 'Could not connect to the server';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
