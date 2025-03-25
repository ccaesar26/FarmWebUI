import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { RegisterRequest, RegisterResponse } from '../models/auth.model';
import { UpdateUserRequest, User } from '../models/user.model';

@Injectable(
  {providedIn: 'root'}
)
export class UserService {
  private apiUrl = `${ environment.apiUrl }/users`;

  constructor(private http: HttpClient) {}

  createUser(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${ this.apiUrl }/create`, request);
  }

  updateUser(request: UpdateUserRequest): Observable<void> {
    return this.http.put<void>(`${ this.apiUrl }/update`, request);
  }

  getWorkerUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${ this.apiUrl }/workers`);
  }
}
