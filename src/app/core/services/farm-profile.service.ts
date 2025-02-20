import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CreateFarmProfileRequest } from '../models/farm-profile.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FarmProfileService {
  private apiUrl = `${environment.apiUrl}/farm-profile`;

  constructor(private http: HttpClient) {}

  createFarmProfile(request: CreateFarmProfileRequest): Observable<any> {
    return this.http.post(this.apiUrl + '/create', request);
  }
}
