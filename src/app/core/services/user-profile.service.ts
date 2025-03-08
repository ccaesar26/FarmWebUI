import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AssignAttributesRequest,
  AttributeMap,
  CreateUserProfileRequest, CreateUserProfileResponse,
  UserProfile
} from '../models/user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private apiUrl = `${environment.apiUrl}/user-profile`;

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

  createUserProfile(request: CreateUserProfileRequest): Observable<CreateUserProfileResponse> {
    return this.http.post<CreateUserProfileResponse>(`${this.apiUrl}/create`, request);
  }

  getManagerProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.apiUrl);
  }

  assignAttributes(request: AssignAttributesRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/attributes/assign`, request);
  }

  // returns a map of available attributes grouped by category
  getAvailableAttributes(): Observable<AttributeMap> {
    return this.http.get<AttributeMap>(`${this.apiUrl}/attributes`);
  }

  getProfileByUserId(userId: string) {
    let params = new HttpParams();
    params = params.append('userId', userId);
    return this.http.get<UserProfile>(`${this.apiUrl}/user`, { params });
  }
}
