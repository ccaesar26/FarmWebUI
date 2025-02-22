import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigResponse } from '../models/config.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiUrl = `${ environment.apiUrl }/config`;

  constructor(private http: HttpClient) {}

  retrieveMapboxToken(): Observable<string> {
    return this.http.get<ConfigResponse>(`${ this.apiUrl }/retrieve/mapbox-access-token`).pipe(
      map(response => response.value)
    );
  }
}
