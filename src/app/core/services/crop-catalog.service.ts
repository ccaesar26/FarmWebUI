import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CropCatalogEntry } from '../models/crop-catalog.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CropCatalogService {
  private apiUrl = `${environment.apiUrl}/cropcatalog`;

  constructor(private http: HttpClient) {}

  getCropCatalogEntries(): Observable<CropCatalogEntry[]> {
    return this.http.get<CropCatalogEntry[]>(this.apiUrl);
  }
}
