import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DailyForecastWithAnimationResponse, WeatherResponse } from '../models/weather.model';
import { Observable } from 'rxjs';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiUrl = `${environment.apiUrl}/weather`;
  private hubConnection!: signalR.HubConnection;

  public onWeatherUpdate: (() => void) | null = null;
  public onDebugUpdate: ((msg: string) => void) | null = null;

  constructor(private http: HttpClient) {}

  startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`http://localhost:5800/weatherHub`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR connection started.'))
      .catch(err => this.onDebugUpdate && this.onDebugUpdate(err));

    this.hubConnection.on('WeatherUpdated', () => {
      console.log('Weather update received.');

      if (this.onWeatherUpdate) {
        this.onWeatherUpdate();
      }
    });
  }

  getWeatherByCity(city: string): Observable<WeatherResponse> {
    return this.http.get<WeatherResponse>(`${this.apiUrl}/current/${city}`);
  }

  getWeatherByCoords(lat: number, lon: number) {
    return this.http.get<WeatherResponse>(`${this.apiUrl}/current?latitude=${lat}&longitude=${lon}`);
  }

  getDailyForecast(lat: number, lon: number, cnt: number = 7): Observable<DailyForecastWithAnimationResponse[]> {
    const params = new HttpParams()
      .set('latitude', lat)
      .set('longitude', lon)
      .set('cnt', cnt.toString());
    return this.http.get<DailyForecastWithAnimationResponse[]>(`${this.apiUrl}/forecast/daily`, { params });
  }
}
