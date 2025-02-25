import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { WeatherResponse } from '../models/weather.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiUrl = `${environment.apiUrl}/weather`;

  constructor(private http: HttpClient) {}

  getWeatherByCity(city: string): Observable<WeatherResponse> {
    return this.http.get<WeatherResponse>(`${this.apiUrl}/current/${city}`);
  }

  getWeatherByCoords(lat: number, lon: number) {
    return this.http.get<WeatherResponse>(`${this.apiUrl}/current?latitude=${lat}&longitude=${lon}`);
  }
}
