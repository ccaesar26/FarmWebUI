import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AttributesRequest,
  AttributeMap,
  CreateUserProfileRequest, CreateUserProfileResponse, UpdateUserProfileRequest,
  UserProfileDto
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

  updateUserProfile(userProfileId: string, request: UpdateUserProfileRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${userProfileId}`, request);
  }

  getManagerProfile(): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(this.apiUrl);
  }

  assignAttributes(request: AttributesRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/attributes/assign`, request);
  }

  updateAttributes(request: AttributesRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/attributes/update`, request);
  }

  // returns a map of available attributes grouped by category
  getAvailableAttributes(): Observable<AttributeMap> {
    return this.http.get<AttributeMap>(`${this.apiUrl}/attributes`);
  }

  getProfileByUserId(userId: string) {
    let params = new HttpParams();
    params = params.append('userId', userId);
    return this.http.get<UserProfileDto>(`${this.apiUrl}/user`, { params });
  }
}
