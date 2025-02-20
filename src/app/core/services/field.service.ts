import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateFieldRequest } from '../models/field.model';

@Injectable({
  providedIn: 'root',
})
export class FieldService {
  private apiUrl = `${environment.apiUrl}/fields`;

  constructor(private http: HttpClient) {}

  createField(request: CreateFieldRequest): Observable<any> {
    return this.http.post(this.apiUrl + '/create', request);
  }
}
