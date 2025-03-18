import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateFieldRequest, Field, GetFieldCoordinatesResponse, GetFieldsCitiesResponse } from '../models/field.model';

@Injectable({
  providedIn: 'root',
})
export class FieldService {
  private apiUrl = `${environment.apiUrl}/fields`;

  constructor(private http: HttpClient) {}

  createField(request: CreateFieldRequest): Observable<any> {
    return this.http.post(this.apiUrl + '/create', request);
  }

  getFields(): Observable<Field[]> {
    return this.http.get<Field[]>(`${this.apiUrl}/all`);
  }

  getFieldsCoordinates(): Observable<GetFieldCoordinatesResponse> {
    return this.http.get<GetFieldCoordinatesResponse>(`${this.apiUrl}/coordinates`);
  }

  getFieldsCities(): Observable<GetFieldsCitiesResponse> {
    return this.http.get<GetFieldsCitiesResponse>(`${this.apiUrl}/cities`);
  }

  getFieldById(fieldId: string): Observable<Field> {
    return this.http.get<Field>(`${this.apiUrl}/${fieldId}`);
  }
}
