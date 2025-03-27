import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import mapboxgl from 'mapbox-gl';

@Injectable({
  providedIn: 'root'
})
export class MapboxGeocoderService {

  constructor(
    private http: HttpClient
  ) {
  }

  searchLocation(query: string): Observable<any> {
    if (!query.trim()) {
      return of([]); // Return empty observable for empty query
    }

    let params = new HttpParams();
    params = params.append('q', encodeURIComponent(query));
    params = params.append('access_token', mapboxgl.accessToken);
    const url = `https://api.mapbox.com/search/geocode/v6/forward`;

    return this.http.get(url, { params }).pipe(
      catchError(error => {
        console.error('Error during Mapbox Geocoding API call in MapboxGeocoderService:', error);
        return of({ features: [] }); // Return empty features array on error
      })
    );
  }
}
