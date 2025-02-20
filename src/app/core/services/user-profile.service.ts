import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private apiUrl = `${environment.apiUrl}/user-profile`; // Adjust if needed

  constructor(private http: HttpClient) {}

  hasProfile(): Observable<boolean> {
    return this.http.get(this.apiUrl).pipe(
      map(() => true), // User profile found
      catchError((error) => {
        if (error.status === 404) {
          return of(false); // User profile not found
        }
        throw error; // Other errors (e.g., 401 Unauthorized)
      })
    );
  }
}
